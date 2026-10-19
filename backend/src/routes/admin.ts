import { Router, Request, Response } from 'express';
import { query } from '../db/postgres.js';
import { directoryStore } from '../services/directoryCache.js';
import { env } from '../config/env.js';

export const adminRouter = Router();

// 0. Admin Authentication Login Endpoint
adminRouter.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required' });
    }

    const expectedUser = env.ADMIN_USERNAME.trim().toLowerCase();
    const expectedPass = env.ADMIN_PASSWORD;

    const submittedUser = username.trim().toLowerCase();

    if (submittedUser === expectedUser && password === expectedPass) {
      return res.json({
        success: true,
        token: `ADMIN_SESSION_${Date.now()}_${Buffer.from(submittedUser).toString('base64')}`,
        user: {
          username: env.ADMIN_USERNAME,
          name: 'MedVexa Desk Administrator',
          role: 'super_admin',
        },
        message: 'Admin authentication successful',
      });
    }

    return res.status(401).json({ error: 'Invalid admin credentials. Access denied.' });
  } catch (err: any) {
    console.error('Error in admin login:', err);
    res.status(500).json({ error: 'Authentication service failure', details: err?.message });
  }
});

// 1. Overview Dashboard Stats
adminRouter.get('/admin/stats', async (_req: Request, res: Response) => {
  try {
    const totalLeadsRes = await query('SELECT count(*) FROM patient_leads');
    const todayLeadsRes = await query(
      "SELECT count(*) FROM patient_leads WHERE created_at >= CURRENT_DATE"
    );
    const urgencyRes = await query(
      "SELECT count(*) FROM patient_leads WHERE urgency = 'emergency' OR urgency = 'priority'"
    );
    const byTargetTypeRes = await query(
      "SELECT target_type, count(*) as count FROM patient_leads GROUP BY target_type"
    );
    const byStatusRes = await query(
      "SELECT status, count(*) as count FROM patient_leads GROUP BY status"
    );
    const portalAccountsRes = await query(
      "SELECT count(*) FROM portal_accounts WHERE dashboard_access_enabled = true"
    );

    // Ensure cache is loaded to report total available doctors & hospitals
    if (!directoryStore.isLoaded) {
      await directoryStore.reloadAll();
    }

    res.json({
      totalLeads: parseInt(totalLeadsRes.rows[0]?.count || '0', 10),
      todayLeads: parseInt(todayLeadsRes.rows[0]?.count || '0', 10),
      priorityLeads: parseInt(urgencyRes.rows[0]?.count || '0', 10),
      activePortalAccounts: parseInt(portalAccountsRes.rows[0]?.count || '0', 10),
      totalDoctors: directoryStore.doctors.length,
      totalHospitals: directoryStore.hospitals.length,
      totalLaboratories: directoryStore.laboratories.length,
      totalWellness: directoryStore.wellnessCenters.length,
      byTargetType: byTargetTypeRes.rows,
      byStatus: byStatusRes.rows,
    });
  } catch (err: any) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats', details: err?.message });
  }
});

// 2. Fetch All Populated Targets (Doctors, Hospitals, Laboratories & Wellness Centers with portal status)
adminRouter.get('/admin/targets', async (_req: Request, res: Response) => {
  try {
    if (!directoryStore.isLoaded) {
      await directoryStore.reloadAll();
    }

    // Fetch existing portal accounts
    const accountsRes = await query('SELECT * FROM portal_accounts');
    const accountsMap = new Map<string, any>();
    accountsRes.rows.forEach((acc) => {
      accountsMap.set(`${acc.target_type}:${acc.target_id}`, acc);
    });

    // Fetch lead counts per target
    const leadCountsRes = await query(
      'SELECT target_type, target_id, count(*) as lead_count FROM patient_leads GROUP BY target_type, target_id'
    );
    const leadCountsMap = new Map<string, number>();
    leadCountsRes.rows.forEach((row) => {
      leadCountsMap.set(`${row.target_type}:${row.target_id}`, parseInt(row.lead_count, 10));
    });

    // 1. Format Doctors: Populated directly from signed-up doctors in the database
    const signedUpDoctorsRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              speciality, experience, whatsapp_number, clinic_address, medical_reg_no,
              is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'doctor'
       ORDER BY created_at DESC`
    );

    let doctors: any[] = [];
    if (signedUpDoctorsRes.rows.length > 0) {
      doctors = signedUpDoctorsRes.rows.map((u) => {
        const key = `doctor:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;
        const displayName = u.name.trim().startsWith('Dr.') ? u.name.trim() : `Dr. ${u.name.trim()}`;

        return {
          id: u.id,
          slug: `dr-${u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
          name: displayName,
          type: 'doctor' as const,
          title: `Consultant — ${u.speciality || 'Specialist'}`,
          speciality: u.speciality || 'General Medicine',
          department: u.speciality || 'General Medicine',
          city: u.city || 'Pune',
          area: u.clinic_address || 'Pune Clinic',
          phone: u.phone ? `${u.country_code || '+91'} ${u.phone}` : '',
          whatsapp: u.whatsapp_number || u.phone || '',
          photo: u.avatar || '',
          experienceYears: u.experience || 'Experienced',
          qualifications: u.medical_reg_no ? `Reg No: ${u.medical_reg_no}` : 'Verified Physician',
          clinicAddress: u.clinic_address || '',
          medicalRegNo: u.medical_reg_no || '',
          primaryHospital: u.clinic_address || 'Private Clinic',
          hasPortalAccount: !!account || true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        };
      });
    } else {
      doctors = directoryStore.doctors.slice(0, 10).map((d) => {
        const key = `doctor:${d.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        return {
          id: d.id,
          slug: d.slug,
          name: d.name,
          type: 'doctor' as const,
          title: d.title || 'Consultant Specialist',
          speciality: d.speciality,
          department: d.department,
          city: d.city || 'Pune',
          area: d.area || '',
          phone: d.phone || '',
          whatsapp: d.whatsapp || '',
          photo: d.photo || '',
          experienceYears: d.experience_years ? `${d.experience_years} years` : '',
          qualifications: d.qualifications,
          clinicAddress: d.area || '',
          medicalRegNo: '',
          primaryHospital: d.hospitals?.[0]?.hospital_name || '',
          hasPortalAccount: !!account,
          portalAccountStatus: account?.account_status || 'not_registered',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? false,
          portalEmail: account?.email || '',
          leadCount,
        };
      });
    }

    // 2. Format Hospitals: Populated directly from signed-up hospitals
    const signedUpHospitalsRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              city, address, pincode, authorized_person_name, authorized_person_phone,
              registration_cert_url, is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'hospital'
       ORDER BY created_at DESC`
    );

    let hospitals: any[] = [];
    if (signedUpHospitalsRes.rows.length > 0) {
      hospitals = signedUpHospitalsRes.rows.map((u) => {
        const key = `hospital:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        return {
          id: u.id,
          slug: `hosp-${u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
          name: u.name,
          type: 'hospital' as const,
          facilityType: 'Multi-Speciality Hospital',
          city: u.city || 'Pune',
          area: u.address || 'Central District',
          address: u.address || '',
          pincode: u.pincode || '',
          phone: u.phone ? `${u.country_code || '+91'} ${u.phone}` : '',
          authorizedPersonName: u.authorized_person_name || '',
          authorizedPersonPhone: u.authorized_person_phone || '',
          registrationCertUrl: u.registration_cert_url || '',
          coverImage: u.avatar || '',
          hasPortalAccount: !!account || true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        };
      });
    } else {
      hospitals = directoryStore.hospitals.slice(0, 15).map((h) => {
        const key = `hospital:${h.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        return {
          id: h.id,
          slug: h.slug,
          name: h.name,
          type: 'hospital' as const,
          facilityType: h.facility_type_badge || h.facility_type || 'Multi-Speciality Hospital',
          city: h.city || 'Pune',
          area: h.area || '',
          address: h.address || '',
          pincode: h.pincode || '',
          phone: h.phone || '',
          bedCount: h.bed_count,
          emergency24x7: h.emergency_available_24x7,
          coverImage: h.images?.[0]?.url || '',
          hasPortalAccount: !!account,
          portalAccountStatus: account?.account_status || 'not_registered',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? false,
          portalEmail: account?.email || '',
          leadCount,
        };
      });
    }

    // 3. Format Laboratories: Populated directly from signed-up laboratories
    const signedUpLabsRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              city, address, pincode, registration_cert_url, address_proof_url,
              is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'laboratory'
       ORDER BY created_at DESC`
    );

    let laboratories: any[] = [];
    if (signedUpLabsRes.rows.length > 0) {
      laboratories = signedUpLabsRes.rows.map((u) => {
        const key = `laboratory:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        return {
          id: u.id,
          slug: `lab-${u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
          name: u.name,
          type: 'laboratory' as const,
          facilityType: 'Diagnostic & Pathology Laboratory',
          city: u.city || 'Pune',
          area: u.address || 'Diagnostic Center',
          address: u.address || '',
          pincode: u.pincode || '',
          phone: u.phone ? `${u.country_code || '+91'} ${u.phone}` : '',
          registrationCertUrl: u.registration_cert_url || '',
          addressProofUrl: u.address_proof_url || '',
          coverImage: u.avatar || '',
          hasPortalAccount: !!account || true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        };
      });
    } else {
      laboratories = directoryStore.laboratories.slice(0, 10).map((l) => {
        const key = `laboratory:${l.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        return {
          id: l.id,
          slug: l.slug,
          name: l.name,
          type: 'laboratory' as const,
          facilityType: 'Diagnostic & Pathology Laboratory',
          city: l.city || 'Pune',
          area: l.area || '',
          address: l.address || '',
          pincode: l.pincode || '',
          phone: l.phone || '',
          coverImage: l.images?.[0]?.url || '',
          hasPortalAccount: !!account,
          portalAccountStatus: account?.account_status || 'not_registered',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? false,
          portalEmail: account?.email || '',
          leadCount,
        };
      });
    }

    // 4. Format Wellness Centers: Populated directly from signed-up wellness centers
    const signedUpWellnessRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              city, address, pincode, registration_cert_url, address_proof_url,
              is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'wellness'
       ORDER BY created_at DESC`
    );

    let wellness: any[] = [];
    if (signedUpWellnessRes.rows.length > 0) {
      wellness = signedUpWellnessRes.rows.map((u) => {
        const key = `wellness:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        return {
          id: u.id,
          slug: `well-${u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
          name: u.name,
          type: 'wellness' as const,
          facilityType: 'Wellness & Integrative Health Center',
          city: u.city || 'Pune',
          area: u.address || 'Wellness Center',
          address: u.address || '',
          pincode: u.pincode || '',
          phone: u.phone ? `${u.country_code || '+91'} ${u.phone}` : '',
          registrationCertUrl: u.registration_cert_url || '',
          addressProofUrl: u.address_proof_url || '',
          coverImage: u.avatar || '',
          hasPortalAccount: !!account || true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        };
      });
    } else {
      wellness = directoryStore.wellnessCenters.slice(0, 10).map((w) => {
        const key = `wellness:${w.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        return {
          id: w.id,
          slug: w.slug,
          name: w.name,
          type: 'wellness' as const,
          facilityType: 'Wellness & Integrative Health Center',
          city: w.city || 'Pune',
          area: w.area || '',
          address: w.address || '',
          pincode: w.pincode || '',
          phone: w.phone || '',
          coverImage: w.images?.[0]?.url || '',
          hasPortalAccount: !!account,
          portalAccountStatus: account?.account_status || 'not_registered',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? false,
          portalEmail: account?.email || '',
          leadCount,
        };
      });
    }

    res.json({
      doctors,
      hospitals,
      laboratories,
      wellness,
      totalCount: doctors.length + hospitals.length + laboratories.length + wellness.length,
    });
  } catch (err: any) {
    console.error('Error fetching admin targets:', err);
    res.status(500).json({ error: 'Failed to fetch targets', details: err?.message });
  }
});

// 3. Register or Toggle Doctor / Hospital Portal Account
adminRouter.post('/admin/targets/account', async (req: Request, res: Response) => {
  try {
    const {
      targetType,
      targetId,
      targetName,
      email,
      phone,
      dashboardAccessEnabled = true,
      accountStatus = 'active',
    } = req.body;

    if (!targetType || !targetId || !targetName) {
      return res.status(400).json({ error: 'targetType, targetId, and targetName are required' });
    }

    const defaultEmail = email || `${targetType}.${targetId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@medvexa.portal`;
    const accountId = `ACC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const checkRes = await query(
      'SELECT id FROM portal_accounts WHERE target_type = $1 AND target_id = $2',
      [targetType, targetId]
    );

    let result;
    if (checkRes.rows.length > 0) {
      // Update existing
      result = await query(
        `UPDATE portal_accounts
         SET dashboard_access_enabled = $1,
             account_status = $2,
             email = COALESCE($3, email),
             phone = COALESCE($4, phone),
             updated_at = NOW()
         WHERE target_type = $5 AND target_id = $6
         RETURNING *`,
        [dashboardAccessEnabled, accountStatus, email || null, phone || null, targetType, targetId]
      );
    } else {
      // Create new portal account
      result = await query(
        `INSERT INTO portal_accounts (
           id, target_type, target_id, target_name, email, phone, account_status, dashboard_access_enabled
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          accountId,
          targetType,
          targetId,
          targetName,
          defaultEmail,
          phone || null,
          accountStatus,
          dashboardAccessEnabled,
        ]
      );
    }

    res.json({
      success: true,
      account: result.rows[0],
      message: `Portal account for ${targetName} is now ${dashboardAccessEnabled ? 'Active & Dashboard Visible' : 'Disabled'}`,
    });
  } catch (err: any) {
    console.error('Error updating portal account:', err);
    res.status(500).json({ error: 'Failed to update portal account', details: err?.message });
  }
});

// 4. Create New Patient Lead / Consultation Ticket and Dispatch
adminRouter.post('/admin/leads', async (req: Request, res: Response) => {
  try {
    const {
      patientName,
      patientPhone,
      patientWhatsapp,
      patientEmail,
      patientAge,
      patientGender,
      patientCity,
      patientArea,
      medicalConcern,
      speciality,
      urgency = 'priority',
      preferredDate,
      preferredTime,
      targetType,
      targetId,
      targetName,
      agentNotes,
      agentName = 'Call Desk Agent',
    } = req.body;

    if (!patientName || !patientPhone || !medicalConcern || !targetType || !targetId || !targetName) {
      return res.status(400).json({
        error: 'Missing required fields: patientName, patientPhone, medicalConcern, targetType, targetId, targetName',
      });
    }

    // Check target portal account status
    const accountRes = await query(
      'SELECT account_status, dashboard_access_enabled FROM portal_accounts WHERE target_type = $1 AND target_id = $2',
      [targetType, targetId]
    );

    let targetAccountStatus = 'pending_onboarding';
    if (accountRes.rows.length > 0 && accountRes.rows[0].dashboard_access_enabled) {
      targetAccountStatus = 'verified_active';
    }

    const leadId = `LEAD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const insertRes = await query(
      `INSERT INTO patient_leads (
        id, patient_name, patient_phone, patient_whatsapp, patient_email,
        patient_age, patient_gender, patient_city, patient_area,
        medical_concern, speciality, urgency, preferred_date, preferred_time,
        target_type, target_id, target_name, target_account_status,
        status, agent_notes, agent_name, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21, NOW(), NOW()
      ) RETURNING *`,
      [
        leadId,
        patientName.trim(),
        patientPhone.trim(),
        patientWhatsapp?.trim() || patientPhone.trim(),
        patientEmail?.trim() || null,
        patientAge ? parseInt(patientAge, 10) : null,
        patientGender || null,
        patientCity?.trim() || 'Pune',
        patientArea?.trim() || null,
        medicalConcern.trim(),
        speciality?.trim() || 'General Consultation',
        urgency,
        preferredDate || null,
        preferredTime || null,
        targetType,
        targetId,
        targetName,
        targetAccountStatus,
        'dispatched',
        agentNotes?.trim() || null,
        agentName,
      ]
    );

    res.status(201).json({
      success: true,
      lead: insertRes.rows[0],
      message: `Lead ${leadId} successfully dispatched to ${targetName}'s panel!`,
    });
  } catch (err: any) {
    console.error('Error creating patient lead:', err);
    res.status(500).json({ error: 'Failed to create patient lead', details: err?.message });
  }
});

// 5. Fetch All Patient Leads with Filtering
adminRouter.get('/admin/leads', async (req: Request, res: Response) => {
  try {
    const { status, targetType, targetId, search } = req.query;

    let queryText = 'SELECT * FROM patient_leads WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      queryText += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (targetType && targetType !== 'all') {
      queryText += ` AND target_type = $${paramIndex++}`;
      params.push(targetType);
    }

    if (targetId) {
      queryText += ` AND target_id = $${paramIndex++}`;
      params.push(targetId);
    }

    if (search) {
      queryText += ` AND (patient_name ILIKE $${paramIndex} OR patient_phone ILIKE $${paramIndex} OR target_name ILIKE $${paramIndex} OR id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ' ORDER BY created_at DESC LIMIT 200';

    const leadsRes = await query(queryText, params);
    res.json({
      leads: leadsRes.rows,
      count: leadsRes.rows.length,
    });
  } catch (err: any) {
    console.error('Error fetching patient leads:', err);
    res.status(500).json({ error: 'Failed to fetch patient leads', details: err?.message });
  }
});

// 6. Update Patient Lead Status
adminRouter.patch('/admin/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, agentNotes } = req.body;

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [id];
    let paramIndex = 2;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (agentNotes !== undefined) {
      updates.push(`agent_notes = $${paramIndex++}`);
      params.push(agentNotes);
    }

    const updateQuery = `
      UPDATE patient_leads
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Lead ${id} not found` });
    }

    res.json({
      success: true,
      lead: result.rows[0],
      message: `Lead ${id} updated successfully`,
    });
  } catch (err: any) {
    console.error('Error updating patient lead:', err);
    res.status(500).json({ error: 'Failed to update patient lead', details: err?.message });
  }
});

// 7. Get Leads For a Specific Target's Dashboard (Doctor or Hospital Panel View)
adminRouter.get('/admin/targets/:targetType/:targetId/leads', async (req: Request, res: Response) => {
  try {
    const { targetType, targetId } = req.params;

    const result = await query(
      `SELECT * FROM patient_leads
       WHERE target_type = $1 AND target_id = $2
       ORDER BY created_at DESC`,
      [targetType, targetId]
    );

    const accountRes = await query(
      `SELECT * FROM portal_accounts WHERE target_type = $1 AND target_id = $2`,
      [targetType, targetId]
    );

    res.json({
      targetType,
      targetId,
      portalAccount: accountRes.rows[0] || null,
      leads: result.rows,
      totalLeads: result.rows.length,
    });
  } catch (err: any) {
    console.error('Error fetching target leads:', err);
    res.status(500).json({ error: 'Failed to fetch target leads', details: err?.message });
  }
});
