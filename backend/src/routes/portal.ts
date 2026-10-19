import { Router, Request, Response } from 'express';
import { query } from '../db/postgres.js';
import { verifyToken } from '../middleware/auth.js';

export const portalRouter = Router();

// GET /api/v1/portal/my-leads
// Also handles GET /api/v1/doctor/my-leads for backwards compatibility
async function handleGetMyLeads(req: Request, res: Response) {
  try {
    // 1. Resolve logged-in user from Auth token or request parameters
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : undefined);

    let userEmail: string | undefined = req.query.email as string;
    let targetId: string | undefined = (req.query.targetId || req.query.doctorId) as string;
    let userName: string | undefined = req.query.name as string;

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.sub) {
        targetId = payload.sub;
      }
      if (payload && payload.email) {
        userEmail = payload.email;
      }
    }

    // 2. Fetch user profile from database
    let activeUser: any = null;

    if (targetId || userEmail) {
      const userRes = await query(
        `SELECT id, email, name, role, phone, country_code, avatar,
                speciality, experience, whatsapp_number, clinic_address, medical_reg_no,
                city, address, pincode, authorized_person_name, authorized_person_phone,
                registration_cert_url, address_proof_url, created_at
         FROM users
         WHERE id = $1 OR email = $2
         LIMIT 1`,
        [targetId || '', (userEmail || '').toLowerCase().trim()]
      );
      if (userRes.rows.length > 0) {
        activeUser = userRes.rows[0];
      }
    }

    // Fallback if no user found
    if (!activeUser && userName) {
      const cleanName = userName.toLowerCase().trim();
      const userRes = await query(
        `SELECT id, email, name, role, phone, country_code, avatar,
                speciality, experience, whatsapp_number, clinic_address, medical_reg_no,
                city, address, pincode, authorized_person_name, authorized_person_phone,
                registration_cert_url, address_proof_url, created_at
         FROM users
         WHERE name ILIKE $1
         LIMIT 1`,
        [`%${cleanName}%`]
      );
      if (userRes.rows.length > 0) {
        activeUser = userRes.rows[0];
      }
    }

    if (!activeUser) {
      // Pick latest registered doctor or hospital as fallback
      const fallbackUserRes = await query(
        `SELECT id, email, name, role, phone, country_code, avatar,
                speciality, experience, whatsapp_number, clinic_address, medical_reg_no,
                city, address, pincode, authorized_person_name, authorized_person_phone,
                registration_cert_url, address_proof_url, created_at
         FROM users
         WHERE role IN ('doctor', 'hospital', 'laboratory', 'wellness')
         ORDER BY created_at DESC
         LIMIT 1`
      );
      if (fallbackUserRes.rows.length > 0) {
        activeUser = fallbackUserRes.rows[0];
      }
    }

    if (!activeUser) {
      return res.status(404).json({
        error: 'No active entity profile found. Please log in with a Doctor, Hospital, Laboratory, or Wellness account.',
      });
    }

    const entityId = activeUser.id;
    const entityType = activeUser.role; // 'doctor' | 'hospital' | 'laboratory' | 'wellness'
    const entityName = activeUser.name;

    // 3. Fetch leads dispatched to this target
    const leadsRes = await query(
      `SELECT * FROM patient_leads
       WHERE target_id = $1
          OR (target_type = $2 AND (target_name ILIKE $3 OR target_name ILIKE $4))
       ORDER BY created_at DESC`,
      [
        entityId,
        entityType,
        `%${entityName}%`,
        `%${entityName.replace(/^(dr\.?|doctor)\s+/i, '').trim()}%`,
      ]
    );

    const leads = leadsRes.rows;

    const stats = {
      total: leads.length,
      dispatched: leads.filter((l) => l.status === 'dispatched').length,
      acknowledged: leads.filter((l) => l.status === 'acknowledged').length,
      inConsultation: leads.filter((l) => l.status === 'in_consultation').length,
      completed: leads.filter((l) => l.status === 'completed').length,
    };

    res.json({
      entity: {
        id: activeUser.id,
        role: activeUser.role,
        type: activeUser.role,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone ? `${activeUser.country_code || '+91'} ${activeUser.phone}` : '',
        city: activeUser.city || 'Pune',
        address: activeUser.address || activeUser.clinic_address || '',
        pincode: activeUser.pincode || '',
        photo: activeUser.avatar || '',
        speciality: activeUser.speciality || '',
        experience: activeUser.experience || '',
        medicalRegNo: activeUser.medical_reg_no || '',
        authorizedPersonName: activeUser.authorized_person_name || '',
        authorizedPersonPhone: activeUser.authorized_person_phone || '',
        registrationCertUrl: activeUser.registration_cert_url || '',
        addressProofUrl: activeUser.address_proof_url || '',
      },
      doctor: {
        id: activeUser.id,
        name: activeUser.name,
        speciality: activeUser.speciality || 'General Medicine',
        city: activeUser.city || 'Pune',
        area: activeUser.address || activeUser.clinic_address || 'Pune',
        photo: activeUser.avatar || '',
        experience: activeUser.experience || '',
        medicalRegNo: activeUser.medical_reg_no || '',
      },
      stats,
      leads,
    });
  } catch (err: any) {
    console.error('Error in portal my-leads:', err);
    res.status(500).json({ error: 'Failed to fetch portal dashboard leads', details: err?.message });
  }
}

// Support both routes
portalRouter.get('/portal/my-leads', handleGetMyLeads);
portalRouter.get('/doctor/my-leads', handleGetMyLeads);

// PATCH /api/v1/portal/leads/:id/status
portalRouter.patch('/portal/leads/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const updateRes = await query(
      `UPDATE patient_leads
       SET status = $1,
           agent_notes = COALESCE($2, agent_notes),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, notes || null, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: `Lead ${id} not found` });
    }

    res.json({
      success: true,
      lead: updateRes.rows[0],
      message: `Lead status updated to ${status}`,
    });
  } catch (err: any) {
    console.error('Error updating lead status:', err);
    res.status(500).json({ error: 'Failed to update lead status', details: err?.message });
  }
});
