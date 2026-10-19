import { Router, Request, Response } from 'express';
import { directoryStore } from '../services/directoryCache.js';
import { query } from '../db/postgres.js';
import { verifyToken } from '../middleware/auth.js';

export const doctorsRouter = Router();

doctorsRouter.get('/doctors', async (req: Request, res: Response) => {
  if (req.query.refresh === 'true') {
    await directoryStore.reloadAll();
  } else {
    await directoryStore.ensureLoaded();
  }

  const { city, speciality, hospital_id, search } = req.query as {
    city?: string;
    speciality?: string;
    hospital_id?: string;
    search?: string;
  };

  const results = directoryStore.getDoctors({
    city,
    speciality,
    hospital_id,
    search,
  });

  res.json(results);
});

// Doctor Personal Portal / Dashboard: My Leads Endpoint
doctorsRouter.get('/doctor/my-leads', async (req: Request, res: Response) => {
  try {
    await directoryStore.ensureLoaded();

    // 1. Resolve logged-in doctor from Auth token or request parameters
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined);

    let userEmail: string | undefined = req.query.email as string;
    let userName: string | undefined = req.query.name as string;
    let requestedDoctorId: string | undefined = req.query.doctorId as string;

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.email) {
        userEmail = payload.email;
      }
    }

    // 2. Fetch signed up doctors from users table
    const signedUpDocsRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              speciality, experience, whatsapp_number, clinic_address, medical_reg_no
       FROM users WHERE role = 'doctor' ORDER BY created_at DESC`
    );
    const signedUpDocs = signedUpDocsRes.rows;

    let matchedDoctor: any = null;

    if (signedUpDocs.length > 0) {
      if (requestedDoctorId) {
        matchedDoctor = signedUpDocs.find(
          (d) => d.id === requestedDoctorId || d.email === requestedDoctorId
        );
      }
      if (!matchedDoctor && userEmail) {
        matchedDoctor = signedUpDocs.find(
          (d) => d.email.toLowerCase() === userEmail!.toLowerCase()
        );
      }
      if (!matchedDoctor && userName) {
        const cleanName = userName.toLowerCase().replace(/^(dr\.?|doctor)\s+/i, '').trim();
        matchedDoctor = signedUpDocs.find((d) => {
          const dClean = d.name.toLowerCase().replace(/^(dr\.?|doctor)\s+/i, '').trim();
          return dClean.includes(cleanName) || cleanName.includes(dClean);
        });
      }
      if (!matchedDoctor && !requestedDoctorId) {
        matchedDoctor = signedUpDocs[0];
      }
    }

    // Fallback to directory store if not found in signed up doctors
    if (!matchedDoctor) {
      if (requestedDoctorId) {
        matchedDoctor = directoryStore.doctors.find(
          (d) => d.id === requestedDoctorId || d.slug === requestedDoctorId
        );
      }
      if (!matchedDoctor && userEmail) {
        const prefix = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        matchedDoctor = directoryStore.doctors.find((d) => {
          const docIdNorm = d.id.toLowerCase().replace(/[^a-z0-9]/g, '');
          const docSlugNorm = d.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
          return docIdNorm.includes(prefix) || prefix.includes(docIdNorm) || docSlugNorm.includes(prefix);
        });
      }
      if (!matchedDoctor && userName) {
        const cleanName = userName.toLowerCase().replace(/^(dr\.?|doctor)\s+/i, '').trim();
        matchedDoctor = directoryStore.doctors.find((d) => {
          const dClean = d.name.toLowerCase().replace(/^(dr\.?|doctor)\s+/i, '').trim();
          return dClean.includes(cleanName) || cleanName.includes(dClean);
        });
      }
    }

    const activeDoctor = matchedDoctor || directoryStore.doctors[0];
    const docId = activeDoctor.id;
    const docName = activeDoctor.name.startsWith('Dr.') ? activeDoctor.name : `Dr. ${activeDoctor.name}`;

    // 3. Query leads from PostgreSQL
    let leadsQuery = `
      SELECT * FROM patient_leads 
      WHERE target_type = 'doctor' 
        AND (target_id = $1 OR target_name ILIKE $2 OR target_name ILIKE $3)
      ORDER BY created_at DESC
    `;
    let queryParams: any[] = [
      docId,
      `%${docName}%`,
      userName ? `%${userName}%` : `%${docName}%`,
    ];

    let leadsRes = await query(leadsQuery, queryParams);

    if (leadsRes.rows.length === 0) {
      const fallbackRes = await query(
        `SELECT * FROM patient_leads WHERE target_type = 'doctor' ORDER BY created_at DESC LIMIT 20`
      );
      leadsRes = fallbackRes;
    }

    // Compute status counts
    const leads = leadsRes.rows;
    const stats = {
      total: leads.length,
      dispatched: leads.filter((l) => l.status === 'dispatched').length,
      acknowledged: leads.filter((l) => l.status === 'acknowledged').length,
      inConsultation: leads.filter((l) => l.status === 'in_consultation').length,
      completed: leads.filter((l) => l.status === 'completed').length,
    };

    // Prepare available doctors list for selector
    const availableDocsList = signedUpDocs.length > 0
      ? signedUpDocs.map((d) => ({
          id: d.id,
          name: d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`,
          speciality: d.speciality || 'General Medicine',
        }))
      : directoryStore.doctors.slice(0, 10).map((d) => ({
          id: d.id,
          name: d.name,
          speciality: d.speciality,
        }));

    res.json({
      doctor: {
        id: activeDoctor.id,
        slug: activeDoctor.slug || `dr-${activeDoctor.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: docName,
        title: activeDoctor.title || `Consultant — ${activeDoctor.speciality || 'Specialist'}`,
        speciality: activeDoctor.speciality || 'General Medicine',
        department: activeDoctor.department || activeDoctor.speciality || 'General Medicine',
        city: activeDoctor.city || 'Pune',
        area: activeDoctor.clinic_address || activeDoctor.area || 'Pune',
        photo: activeDoctor.avatar || activeDoctor.photo || '',
        hospital: activeDoctor.clinic_address || activeDoctor.hospitals?.[0]?.hospital_name || 'Private Clinic / Hospital',
        experience: activeDoctor.experience || `${activeDoctor.experience_years || ''} years`,
        medicalRegNo: activeDoctor.medical_reg_no || '',
      },
      stats,
      leads,
      availableDoctors: availableDocsList,
    });
  } catch (err: any) {
    console.error('Error fetching doctor my-leads:', err);
    res.status(500).json({ error: 'Failed to fetch doctor dashboard leads', details: err?.message });
  }
});

// Update lead status from Doctor Dashboard
doctorsRouter.patch('/doctor/leads/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updates: string[] = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status, id];

    if (doctorNotes !== undefined) {
      updates.push(`agent_notes = COALESCE(agent_notes, '') || ' | Dr Note: ' || $3`);
      params.push(doctorNotes);
    }

    const updateQuery = `
      UPDATE patient_leads
      SET ${updates.join(', ')}
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Lead ${id} not found` });
    }

    res.json({
      success: true,
      lead: result.rows[0],
      message: `Lead status updated to ${status} in database.`,
    });
  } catch (err: any) {
    console.error('Error updating lead from doctor dashboard:', err);
    res.status(500).json({ error: 'Failed to update lead status', details: err?.message });
  }
});

doctorsRouter.get('/doctors/:slug', async (req: Request, res: Response) => {
  await directoryStore.ensureLoaded();
  const { slug } = req.params;
  const doctor = directoryStore.getDoctorBySlug(slug);

  if (!doctor) {
    res.status(404).json({ detail: `Doctor with slug '${slug}' not found` });
    return;
  }

  res.json(doctor);
});
