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

    // 1. Format Doctors: Include all doctors from the database `doctors` table, plus portal account info
    const signedUpDoctorsRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              speciality, experience, whatsapp_number, clinic_address, medical_reg_no,
              is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'doctor'
       ORDER BY created_at DESC`
    );

    const userDoctorsMap = new Map<string, any>();
    signedUpDoctorsRes.rows.forEach((u) => {
      userDoctorsMap.set(u.id, u);
      if (u.email) userDoctorsMap.set(u.email.toLowerCase(), u);
    });

    const doctorsSeen = new Set<string>();
    const doctors: any[] = [];

    // First, add all doctors from the PostgreSQL doctors table
    for (const d of directoryStore.doctors) {
      doctorsSeen.add(d.id);
      const key = `doctor:${d.id}`;
      const account = accountsMap.get(key);
      const leadCount = leadCountsMap.get(key) || 0;
      const userMatch = userDoctorsMap.get(d.id);

      doctors.push({
        id: d.id,
        slug: d.slug,
        name: d.name,
        type: 'doctor' as const,
        title: d.title || 'Consultant Specialist',
        speciality: d.speciality || 'General Medicine',
        department: d.department || d.speciality || 'General Medicine',
        city: d.city || 'Pune',
        area: d.area || '',
        phone: d.phone || userMatch?.phone || '',
        whatsapp: d.whatsapp || userMatch?.whatsapp_number || '',
        photo: d.photo || userMatch?.avatar || '',
        experienceYears: d.experience_years ? `${d.experience_years} years` : (userMatch?.experience || ''),
        qualifications: d.qualifications || userMatch?.medical_reg_no || '',
        clinicAddress: d.area || userMatch?.clinic_address || '',
        medicalRegNo: userMatch?.medical_reg_no || '',
        primaryHospital: d.hospitals?.[0]?.hospital_name || userMatch?.clinic_address || 'Affiliated Hospital',
        hasPortalAccount: !!account || !!userMatch,
        portalAccountStatus: account?.account_status || (userMatch ? 'active' : 'not_registered'),
        dashboardAccessEnabled: account?.dashboard_access_enabled ?? (!!userMatch),
        portalEmail: account?.email || userMatch?.email || '',
        leadCount,
      });
    }

    // Also include any signed-up doctor accounts not already in the doctors table
    for (const u of signedUpDoctorsRes.rows) {
      if (!doctorsSeen.has(u.id)) {
        const key = `doctor:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;
        const displayName = u.name.trim().startsWith('Dr.') ? u.name.trim() : `Dr. ${u.name.trim()}`;

        doctors.push({
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
          hasPortalAccount: true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        });
      }
    }

    // 2. Format Hospitals: Include all hospitals from the database `hospitals` table, plus portal accounts
    const signedUpHospitalsRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              city, address, pincode, authorized_person_name, authorized_person_phone,
              registration_cert_url, is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'hospital'
       ORDER BY created_at DESC`
    );

    const userHospitalsMap = new Map<string, any>();
    signedUpHospitalsRes.rows.forEach((u) => {
      userHospitalsMap.set(u.id, u);
      if (u.email) userHospitalsMap.set(u.email.toLowerCase(), u);
    });

    const hospitalsSeen = new Set<string>();
    const hospitals: any[] = [];

    for (const h of directoryStore.hospitals) {
      hospitalsSeen.add(h.id);
      const key = `hospital:${h.id}`;
      const account = accountsMap.get(key);
      const leadCount = leadCountsMap.get(key) || 0;
      const userMatch = userHospitalsMap.get(h.id);

      hospitals.push({
        id: h.id,
        slug: h.slug,
        name: h.name,
        type: 'hospital' as const,
        facilityType: h.facility_type_badge || h.facility_type || 'Multi-Speciality Hospital',
        city: h.city || 'Pune',
        area: h.area || '',
        address: h.address || '',
        pincode: h.pincode || '',
        phone: h.phone || userMatch?.phone || '',
        bedCount: h.bed_count,
        emergency24x7: h.emergency_available_24x7,
        coverImage: h.images?.[0]?.url || userMatch?.avatar || '',
        hasPortalAccount: !!account || !!userMatch,
        portalAccountStatus: account?.account_status || (userMatch ? 'active' : 'not_registered'),
        dashboardAccessEnabled: account?.dashboard_access_enabled ?? (!!userMatch),
        portalEmail: account?.email || userMatch?.email || '',
        leadCount,
      });
    }

    for (const u of signedUpHospitalsRes.rows) {
      if (!hospitalsSeen.has(u.id)) {
        const key = `hospital:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        hospitals.push({
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
          hasPortalAccount: true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        });
      }
    }

    // 3. Format Laboratories: Include all laboratories from database `laboratories` table, plus portal accounts
    const signedUpLabsRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              city, address, pincode, registration_cert_url, address_proof_url,
              is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'laboratory'
       ORDER BY created_at DESC`
    );

    const userLabsMap = new Map<string, any>();
    signedUpLabsRes.rows.forEach((u) => {
      userLabsMap.set(u.id, u);
      if (u.email) userLabsMap.set(u.email.toLowerCase(), u);
    });

    const labsSeen = new Set<string>();
    const laboratories: any[] = [];

    for (const l of directoryStore.laboratories) {
      labsSeen.add(l.id);
      const key = `laboratory:${l.id}`;
      const account = accountsMap.get(key);
      const leadCount = leadCountsMap.get(key) || 0;
      const userMatch = userLabsMap.get(l.id);

      laboratories.push({
        id: l.id,
        slug: l.slug,
        name: l.name,
        type: 'laboratory' as const,
        facilityType: 'Diagnostic & Pathology Laboratory',
        city: l.city || 'Pune',
        area: l.area || '',
        address: l.address || '',
        pincode: l.pincode || '',
        phone: l.phone || userMatch?.phone || '',
        coverImage: l.images?.[0]?.url || userMatch?.avatar || '',
        hasPortalAccount: !!account || !!userMatch,
        portalAccountStatus: account?.account_status || (userMatch ? 'active' : 'not_registered'),
        dashboardAccessEnabled: account?.dashboard_access_enabled ?? (!!userMatch),
        portalEmail: account?.email || userMatch?.email || '',
        leadCount,
      });
    }

    for (const u of signedUpLabsRes.rows) {
      if (!labsSeen.has(u.id)) {
        const key = `laboratory:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        laboratories.push({
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
          hasPortalAccount: true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        });
      }
    }

    // 4. Format Wellness Centers: Include all wellness centers from database `wellness_centers` table
    const signedUpWellnessRes = await query(
      `SELECT id, email, name, role, phone, country_code, avatar,
              city, address, pincode, registration_cert_url, address_proof_url,
              is_active, is_verified, created_at, updated_at
       FROM users
       WHERE role = 'wellness'
       ORDER BY created_at DESC`
    );

    const userWellnessMap = new Map<string, any>();
    signedUpWellnessRes.rows.forEach((u) => {
      userWellnessMap.set(u.id, u);
      if (u.email) userWellnessMap.set(u.email.toLowerCase(), u);
    });

    const wellnessSeen = new Set<string>();
    const wellness: any[] = [];

    for (const w of directoryStore.wellnessCenters) {
      wellnessSeen.add(w.id);
      const key = `wellness:${w.id}`;
      const account = accountsMap.get(key);
      const leadCount = leadCountsMap.get(key) || 0;
      const userMatch = userWellnessMap.get(w.id);

      wellness.push({
        id: w.id,
        slug: w.slug,
        name: w.name,
        type: 'wellness' as const,
        facilityType: 'Wellness & Integrative Health Center',
        city: w.city || 'Pune',
        area: w.area || '',
        address: w.address || '',
        pincode: w.pincode || '',
        phone: w.phone || userMatch?.phone || '',
        coverImage: w.images?.[0]?.url || userMatch?.avatar || '',
        hasPortalAccount: !!account || !!userMatch,
        portalAccountStatus: account?.account_status || (userMatch ? 'active' : 'not_registered'),
        dashboardAccessEnabled: account?.dashboard_access_enabled ?? (!!userMatch),
        portalEmail: account?.email || userMatch?.email || '',
        leadCount,
      });
    }

    for (const u of signedUpWellnessRes.rows) {
      if (!wellnessSeen.has(u.id)) {
        const key = `wellness:${u.id}`;
        const account = accountsMap.get(key);
        const leadCount = leadCountsMap.get(key) || 0;

        wellness.push({
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
          hasPortalAccount: true,
          portalAccountStatus: account?.account_status || 'active',
          dashboardAccessEnabled: account?.dashboard_access_enabled ?? true,
          portalEmail: u.email,
          leadCount,
        });
      }
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

// Helper for slug generation
function slugifyEntity(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 8. Create New Hospital (Direct Admin Ingestion with Doctors & Labs Affiliation)
adminRouter.post('/admin/hospitals', async (req: Request, res: Response) => {
  try {
    const {
      name,
      city,
      area,
      state,
      address,
      pincode = '',
      facility_type = 'Super-Speciality Tertiary Care',
      facility_type_badge = 'Accredited Tertiary Hospital',
      bed_count,
      emergency_available_24x7 = true,
      phone = '+91 20 6721 5000',
      whatsapp = '+91 20 6721 5000',
      website = '',
      maps_url = '',
      overview = '',
      services = [],
      departments = [],
      facilities = [],
      images = [],
      connected_doctor_ids = [],
      connected_laboratory_ids = [],
    } = req.body;

    if (!name || !city || !state || !address) {
      return res.status(400).json({
        error: 'Missing required hospital fields: name, city, state, and address are mandatory.',
      });
    }

    // Determine deterministic slug and id
    let baseSlug = slugifyEntity(name);
    let hospitalId = baseSlug.replace(/-/g, '_').slice(0, 64);

    // Check if ID already exists for a different hospital name/city
    const existingCheck = await query('SELECT id, name, city FROM hospitals WHERE id = $1', [hospitalId]);
    if (existingCheck.rows.length > 0) {
      const row = existingCheck.rows[0];
      if (row.name.toLowerCase() !== name.toLowerCase() || row.city.toLowerCase() !== city.toLowerCase()) {
        baseSlug = `${baseSlug}-${slugifyEntity(city)}`;
        hospitalId = baseSlug.replace(/-/g, '_').slice(0, 64);
      }
    }

    // Format Departments
    let formattedDepts: Array<{ name: string; slug: string }> = [];
    if (Array.isArray(departments)) {
      formattedDepts = departments
        .map((d: any) => {
          if (typeof d === 'string') {
            const clean = d.trim();
            return clean ? { name: clean, slug: slugifyEntity(clean) } : null;
          } else if (d && d.name) {
            return { name: d.name.trim(), slug: d.slug || slugifyEntity(d.name) };
          }
          return null;
        })
        .filter(Boolean) as Array<{ name: string; slug: string }>;
    }

    // Format Services
    let formattedServices: string[] = [];
    if (Array.isArray(services)) {
      formattedServices = services.map((s: any) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
    } else if (typeof services === 'string') {
      formattedServices = (services as string).split('\n').map((s) => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    }

    // Format Facilities
    let formattedFacilities: string[] = [];
    if (Array.isArray(facilities)) {
      formattedFacilities = facilities.map((f: any) => (typeof f === 'string' ? f.trim() : '')).filter(Boolean);
    } else if (typeof facilities === 'string') {
      formattedFacilities = (facilities as string).split('\n').map((f) => f.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    }

    // Format Images
    let formattedImages: any[] = [];
    if (Array.isArray(images) && images.length > 0) {
      formattedImages = images.map((img: any, i: number) => ({
        url: img.url || '',
        card_url: img.card_url || img.url || '',
        alt: img.alt || `${name} - View ${i + 1}`,
        caption: img.caption || `${name} - View ${i + 1}`,
      })).filter((img) => !!img.url);
    }

    const defaultSource = [
      {
        name: 'MedVexa Admin Portal Registry',
        type: 'official-registry',
        dateChecked: new Date().toISOString().split('T')[0],
      },
    ];

    const parsedBeds = bed_count ? parseInt(bed_count.toString(), 10) : null;

    // Upsert into hospitals table
    const insertSql = `
      INSERT INTO hospitals (
        id, slug, name, state, city, area, address, pincode,
        facility_type, facility_type_badge, overview, bed_count,
        emergency_available_24x7, website, phone, whatsapp, maps_url,
        verification_status, last_checked, images, services, departments, facilities, sources,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        area = EXCLUDED.area,
        address = EXCLUDED.address,
        pincode = EXCLUDED.pincode,
        facility_type = EXCLUDED.facility_type,
        facility_type_badge = EXCLUDED.facility_type_badge,
        overview = EXCLUDED.overview,
        bed_count = EXCLUDED.bed_count,
        emergency_available_24x7 = EXCLUDED.emergency_available_24x7,
        website = EXCLUDED.website,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        maps_url = EXCLUDED.maps_url,
        verification_status = EXCLUDED.verification_status,
        last_checked = EXCLUDED.last_checked,
        images = EXCLUDED.images,
        services = EXCLUDED.services,
        departments = EXCLUDED.departments,
        facilities = EXCLUDED.facilities,
        sources = EXCLUDED.sources,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(insertSql, [
      hospitalId,
      baseSlug.slice(0, 128),
      name.slice(0, 255),
      state.slice(0, 100),
      city.toLowerCase().slice(0, 100),
      (area || city).slice(0, 100),
      address,
      pincode.slice(0, 50),
      facility_type.slice(0, 255),
      facility_type_badge.slice(0, 255),
      overview || null,
      parsedBeds,
      !!emergency_available_24x7,
      (website || '').slice(0, 255),
      (phone || '').slice(0, 255),
      (whatsapp || phone || '').slice(0, 255),
      maps_url || null,
      'provider-confirmed',
      new Date().toISOString().split('T')[0],
      JSON.stringify(formattedImages),
      JSON.stringify(formattedServices),
      JSON.stringify(formattedDepts),
      JSON.stringify(formattedFacilities),
      JSON.stringify(defaultSource),
    ]);

    // Handle connected doctors affiliations
    if (Array.isArray(connected_doctor_ids) && connected_doctor_ids.length > 0) {
      for (const rawDocId of connected_doctor_ids) {
        const docId = (rawDocId || '').trim();
        if (!docId) continue;
        const docCheck = await query(
          'SELECT id FROM doctors WHERE id = $1 OR slug = $1 OR LOWER(name) = LOWER($1) LIMIT 1',
          [docId]
        );
        if (docCheck.rows.length === 0) continue;
        const resolvedDocId = docCheck.rows[0].id;

        await query(
          `INSERT INTO doctor_hospital_affiliations (doctor_id, hospital_id, days, timings, note)
           VALUES ($1, $2, 'By Appointment', 'Regular OPD Hours', 'Hospital consultation verified.')
           ON CONFLICT (doctor_id, hospital_id) DO NOTHING`,
          [resolvedDocId, hospitalId]
        );
      }
    }

    // Handle connected laboratories affiliations
    if (Array.isArray(connected_laboratory_ids) && connected_laboratory_ids.length > 0) {
      for (const labId of connected_laboratory_ids) {
        if (!labId) continue;
        await query(
          `INSERT INTO hospital_laboratory_affiliations (hospital_id, laboratory_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [hospitalId, labId]
        );
      }
    }

    // Invalidate & Reload in-memory store
    await directoryStore.reloadAll();

    return res.status(201).json({
      success: true,
      hospital: result.rows[0],
      message: `Hospital "${name}" successfully registered and published!`,
      frontendUrl: `/hospitals/${baseSlug}`,
    });
  } catch (err: any) {
    console.error('Error adding hospital in admin:', err);
    res.status(500).json({ error: 'Failed to create hospital record', details: err?.message });
  }
});

// 9. Create New Laboratory (Direct Admin Ingestion with Hospitals & Doctors Affiliation)
adminRouter.post('/admin/laboratories', async (req: Request, res: Response) => {
  try {
    const {
      name,
      city,
      area,
      state = 'Maharashtra',
      address,
      pincode = '',
      accreditation = 'NABL Accredited Diagnostics',
      home_sample_collection = true,
      emergency_available_24x7 = true,
      phone = '+91 20 4444 2424',
      whatsapp = '+91 91234 56780',
      website = '',
      maps_url = '',
      overview = '',
      services = [],
      departments = [],
      facilities = [],
      images = [],
      connected_hospital_ids = [],
      connected_doctor_ids = [],
    } = req.body;

    if (!name || !city || !state || !address) {
      return res.status(400).json({
        error: 'Missing required laboratory fields: name, city, state, and address are mandatory.',
      });
    }

    // Determine deterministic slug and id
    let baseSlug = slugifyEntity(name);
    let labId = baseSlug.replace(/-/g, '_').slice(0, 64);

    // Check if ID already exists for a different laboratory name/city
    const existingCheck = await query('SELECT id, name, city FROM laboratories WHERE id = $1', [labId]);
    if (existingCheck.rows.length > 0) {
      const row = existingCheck.rows[0];
      if (row.name.toLowerCase() !== name.toLowerCase() || row.city.toLowerCase() !== city.toLowerCase()) {
        baseSlug = `${baseSlug}-${slugifyEntity(city)}`;
        labId = baseSlug.replace(/-/g, '_').slice(0, 64);
      }
    }

    // Format Departments
    let formattedDepts: Array<{ name: string; slug: string }> = [];
    if (Array.isArray(departments)) {
      formattedDepts = departments
        .map((d: any) => {
          if (typeof d === 'string') {
            const clean = d.trim();
            return clean ? { name: clean, slug: slugifyEntity(clean) } : null;
          } else if (d && d.name) {
            return { name: d.name.trim(), slug: d.slug || slugifyEntity(d.name) };
          }
          return null;
        })
        .filter(Boolean) as Array<{ name: string; slug: string }>;
    }

    // Format Services
    let formattedServices: string[] = [];
    if (Array.isArray(services)) {
      formattedServices = services.map((s: any) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
    } else if (typeof services === 'string') {
      formattedServices = (services as string).split('\n').map((s) => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    }

    // Format Facilities
    let formattedFacilities: string[] = [];
    if (Array.isArray(facilities)) {
      formattedFacilities = facilities.map((f: any) => (typeof f === 'string' ? f.trim() : '')).filter(Boolean);
    } else if (typeof facilities === 'string') {
      formattedFacilities = (facilities as string).split('\n').map((f) => f.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    }

    // Format Images
    let formattedImages: any[] = [];
    if (Array.isArray(images) && images.length > 0) {
      formattedImages = images.map((img: any, i: number) => ({
        url: img.url || '',
        card_url: img.card_url || img.url || '',
        alt: img.alt || `${name} - View ${i + 1}`,
        caption: img.caption || `${name} - View ${i + 1}`,
        is_primary: !!img.is_primary,
      })).filter((img) => !!img.url);
    }

    const defaultSource = [
      {
        name: 'MedVexa Laboratory Registry',
        type: 'official-registry',
        dateChecked: new Date().toISOString().split('T')[0],
      },
    ];

    // Upsert into laboratories table
    const insertSql = `
      INSERT INTO laboratories (
        id, slug, name, state, city, area, address, pincode,
        accreditation, overview, home_sample_collection, emergency_available_24x7,
        website, phone, whatsapp, maps_url,
        verification_status, last_checked, images, services, departments, facilities, sources,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        area = EXCLUDED.area,
        address = EXCLUDED.address,
        pincode = EXCLUDED.pincode,
        accreditation = EXCLUDED.accreditation,
        overview = EXCLUDED.overview,
        home_sample_collection = EXCLUDED.home_sample_collection,
        emergency_available_24x7 = EXCLUDED.emergency_available_24x7,
        website = EXCLUDED.website,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        maps_url = EXCLUDED.maps_url,
        verification_status = EXCLUDED.verification_status,
        last_checked = EXCLUDED.last_checked,
        images = EXCLUDED.images,
        services = EXCLUDED.services,
        departments = EXCLUDED.departments,
        facilities = EXCLUDED.facilities,
        sources = EXCLUDED.sources,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(insertSql, [
      labId,
      baseSlug.slice(0, 128),
      name.slice(0, 255),
      state.slice(0, 100),
      city.toLowerCase().slice(0, 100),
      (area || city).slice(0, 100),
      address,
      pincode.slice(0, 50),
      accreditation ? accreditation.slice(0, 255) : null,
      overview || null,
      !!home_sample_collection,
      !!emergency_available_24x7,
      (website || '').slice(0, 255),
      (phone || '').slice(0, 255),
      (whatsapp || phone || '').slice(0, 255),
      maps_url || null,
      'provider-confirmed',
      new Date().toISOString().split('T')[0],
      JSON.stringify(formattedImages),
      JSON.stringify(formattedServices),
      JSON.stringify(formattedDepts),
      JSON.stringify(formattedFacilities),
      JSON.stringify(defaultSource),
    ]);

    // Handle connected hospitals affiliations
    if (Array.isArray(connected_hospital_ids) && connected_hospital_ids.length > 0) {
      for (const hospId of connected_hospital_ids) {
        if (!hospId) continue;
        const hospCheck = await query('SELECT id FROM hospitals WHERE id = $1', [hospId]);
        if (hospCheck.rows.length === 0) continue;

        await query(
          `INSERT INTO hospital_laboratory_affiliations (hospital_id, laboratory_id)
           VALUES ($1, $2)
           ON CONFLICT (hospital_id, laboratory_id) DO NOTHING`,
          [hospId, labId]
        );
      }
    }

    // Handle connected doctors affiliations
    if (Array.isArray(connected_doctor_ids) && connected_doctor_ids.length > 0) {
      for (const docId of connected_doctor_ids) {
        if (!docId) continue;
        const docCheck = await query('SELECT id FROM doctors WHERE id = $1', [docId]);
        if (docCheck.rows.length === 0) continue;

        await query(
          `INSERT INTO doctor_laboratory_affiliations (doctor_id, laboratory_id)
           VALUES ($1, $2)
           ON CONFLICT (doctor_id, laboratory_id) DO NOTHING`,
          [docId, labId]
        );
      }
    }

    // Invalidate & Reload in-memory store
    await directoryStore.reloadAll();

    return res.status(201).json({
      success: true,
      laboratory: result.rows[0],
      message: `Laboratory "${name}" successfully registered and published!`,
      frontendUrl: `/laboratories/${baseSlug}`,
    });
  } catch (err: any) {
    console.error('Error adding laboratory in admin:', err);
    res.status(500).json({ error: 'Failed to create laboratory record', details: err?.message });
  }
});

// 10. Delete Laboratory by ID
adminRouter.delete('/admin/laboratories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM hospital_laboratory_affiliations WHERE laboratory_id = $1', [id]);
    await query('DELETE FROM doctor_laboratory_affiliations WHERE laboratory_id = $1', [id]);
    const delRes = await query('DELETE FROM laboratories WHERE id = $1 RETURNING *', [id]);
    await directoryStore.reloadAll();
    return res.json({
      success: true,
      message: `Laboratory ${id} deleted successfully`,
      deletedCount: delRes.rowCount,
    });
  } catch (err: any) {
    console.error('Error deleting laboratory:', err);
    res.status(500).json({ error: 'Failed to delete laboratory', details: err?.message });
  }
});

// 11. Create New Doctor (Direct Admin Ingestion with Hospital & Laboratory Affiliations)
adminRouter.post('/admin/doctors', async (req: Request, res: Response) => {
  try {
    const {
      name,
      title = 'Consultant Specialist',
      city,
      area = '',
      state = 'Maharashtra',
      speciality,
      department,
      sub_speciality = '',
      qualifications,
      experience_years,
      languages = ['English', 'Hindi'],
      phone = '+91 20 6721 5000',
      whatsapp = '+91 20 6721 5000',
      summary = '',
      areas_of_practice = [],
      photo = '',
      images = [],
      hospital_affiliations = [],
      connected_laboratory_ids = [],
    } = req.body;

    if (!name || !city || !speciality) {
      return res.status(400).json({
        error: 'Missing required doctor fields: name, city, and speciality are mandatory.',
      });
    }

    // Determine deterministic slug and id
    let baseSlug = slugifyEntity(name);
    let docId = baseSlug.replace(/-/g, '_').slice(0, 64);

    // Check if ID already exists for a different doctor name
    const existingCheck = await query('SELECT id, name, city FROM doctors WHERE id = $1', [docId]);
    if (existingCheck.rows.length > 0) {
      const row = existingCheck.rows[0];
      if (row.name.toLowerCase() !== name.toLowerCase() || row.city.toLowerCase() !== city.toLowerCase()) {
        baseSlug = `${baseSlug}-${slugifyEntity(city)}`;
        docId = baseSlug.replace(/-/g, '_').slice(0, 64);
      }
    }

    // Determine primary photo
    let primaryPhoto = photo;
    if (Array.isArray(images) && images.length > 0) {
      const primaryImg = images.find((img: any) => img.is_primary) || images[0];
      if (primaryImg && primaryImg.url) {
        primaryPhoto = primaryImg.url;
      }
    }

    // Format Languages
    let formattedLanguages: string[] = [];
    if (Array.isArray(languages)) {
      formattedLanguages = languages.map((l: any) => (typeof l === 'string' ? l.trim() : '')).filter(Boolean);
    } else if (typeof languages === 'string') {
      formattedLanguages = (languages as string).split(/[,|\n]/).map((l) => l.trim()).filter(Boolean);
    }

    // Format Areas of Practice
    let formattedAreas: string[] = [];
    if (Array.isArray(areas_of_practice)) {
      formattedAreas = areas_of_practice.map((a: any) => (typeof a === 'string' ? a.trim() : '')).filter(Boolean);
    } else if (typeof areas_of_practice === 'string') {
      formattedAreas = (areas_of_practice as string).split('\n').map((a) => a.trim().replace(/^[-*•]\s*/, '')).filter(Boolean);
    }

    const deptVal = department || speciality;
    const deptSlug = slugifyEntity(deptVal);
    const specSlug = slugifyEntity(speciality);
    const parsedExp = experience_years ? parseInt(experience_years.toString(), 10) : null;

    const defaultSource = [
      {
        name: 'MedVexa Doctor Faculty Registry',
        type: 'official-registry',
        dateChecked: new Date().toISOString().split('T')[0],
      },
    ];

    // Upsert into doctors table
    const insertSql = `
      INSERT INTO doctors (
        id, slug, name, title, department, department_slug, speciality, speciality_slug,
        sub_speciality, qualifications, experience_years, photo, summary,
        city, state, area, location, phone, whatsapp,
        verification_status, last_checked, languages, areas_of_practice, sources,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        department = EXCLUDED.department,
        department_slug = EXCLUDED.department_slug,
        speciality = EXCLUDED.speciality,
        speciality_slug = EXCLUDED.speciality_slug,
        sub_speciality = EXCLUDED.sub_speciality,
        qualifications = EXCLUDED.qualifications,
        experience_years = EXCLUDED.experience_years,
        photo = EXCLUDED.photo,
        summary = EXCLUDED.summary,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        area = EXCLUDED.area,
        location = EXCLUDED.location,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        verification_status = EXCLUDED.verification_status,
        last_checked = EXCLUDED.last_checked,
        languages = EXCLUDED.languages,
        areas_of_practice = EXCLUDED.areas_of_practice,
        sources = EXCLUDED.sources,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(insertSql, [
      docId,
      baseSlug.slice(0, 128),
      name.slice(0, 255),
      (title || 'Consultant Specialist').slice(0, 255),
      deptVal.slice(0, 100),
      deptSlug.slice(0, 100),
      speciality.slice(0, 100),
      specSlug.slice(0, 100),
      sub_speciality ? sub_speciality.slice(0, 255) : null,
      (qualifications || 'MBBS').slice(0, 255),
      parsedExp,
      primaryPhoto || null,
      summary || null,
      city.toLowerCase().slice(0, 100),
      state.slice(0, 100),
      (area || city).slice(0, 100),
      `${area ? `${area}, ` : ''}${city}`.slice(0, 255),
      (phone || '').slice(0, 255),
      (whatsapp || phone || '').slice(0, 255),
      'provider-confirmed',
      new Date().toISOString().split('T')[0],
      JSON.stringify(formattedLanguages),
      JSON.stringify(formattedAreas),
      JSON.stringify(defaultSource),
    ]);

    // Handle Hospital Affiliations (Schedule)
    if (Array.isArray(hospital_affiliations) && hospital_affiliations.length > 0) {
      for (const aff of hospital_affiliations) {
        const hospId = (typeof aff === 'string' ? aff : aff.hospital_id || '').trim();
        if (!hospId) continue;

        // Verify hospital exists (supports id, slug, or name matching)
        const hospCheck = await query(
          'SELECT id FROM hospitals WHERE id = $1 OR slug = $1 OR LOWER(name) = LOWER($1) LIMIT 1',
          [hospId]
        );
        if (hospCheck.rows.length === 0) continue;
        const resolvedHospId = hospCheck.rows[0].id;

        const days = (typeof aff === 'object' && aff.days) ? aff.days : 'Mon - Sat';
        const timings = (typeof aff === 'object' && aff.timings) ? aff.timings : '11:00 AM - 02:00 PM';
        const note = (typeof aff === 'object' && aff.note) ? aff.note : 'Prior appointment required';

        await query(
          `INSERT INTO doctor_hospital_affiliations (doctor_id, hospital_id, days, timings, note)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (doctor_id, hospital_id) DO UPDATE SET
             days = EXCLUDED.days,
             timings = EXCLUDED.timings,
             note = EXCLUDED.note`,
          [docId, resolvedHospId, days, timings, note]
        );
      }
    }

    // Handle Connected Laboratories Affiliations
    if (Array.isArray(connected_laboratory_ids) && connected_laboratory_ids.length > 0) {
      for (const labId of connected_laboratory_ids) {
        if (!labId) continue;
        const labCheck = await query('SELECT id FROM laboratories WHERE id = $1', [labId]);
        if (labCheck.rows.length === 0) continue;

        await query(
          `INSERT INTO doctor_laboratory_affiliations (doctor_id, laboratory_id)
           VALUES ($1, $2)
           ON CONFLICT (doctor_id, laboratory_id) DO NOTHING`,
          [docId, labId]
        );
      }
    }

    // Store gallery images in images table if any
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.url) continue;
        const imgId = `${docId}_img_${i + 1}`;
        await query(
          `INSERT INTO images (id, entity_type, entity_id, object_key, content_hash, url, card_url, full_url, mime_type, sort_order)
           VALUES ($1, 'doctors', $2, $3, $4, $5, $6, $7, 'image/webp', $8)
           ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, card_url = EXCLUDED.card_url`,
          [imgId, docId, img.url, `${docId}_${i}`, img.url, img.card_url || img.url, img.url, i + 1]
        );
      }
    }

    // Invalidate & Reload in-memory store
    await directoryStore.reloadAll();

    return res.status(201).json({
      success: true,
      doctor: result.rows[0],
      message: `Doctor "${name}" successfully registered and published!`,
      frontendUrl: `/doctors/${baseSlug}`,
    });
  } catch (err: any) {
    console.error('Error adding doctor in admin:', err);
    res.status(500).json({ error: 'Failed to create doctor record', details: err?.message });
  }
});

// 12. Delete Doctor by ID
adminRouter.delete('/admin/doctors/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM doctor_hospital_affiliations WHERE doctor_id = $1', [id]);
    await query('DELETE FROM doctor_laboratory_affiliations WHERE doctor_id = $1', [id]);
    await query('DELETE FROM images WHERE entity_type = $1 AND entity_id = $2', ['doctors', id]);
    const delRes = await query('DELETE FROM doctors WHERE id = $1 RETURNING *', [id]);
    await directoryStore.reloadAll();
    return res.json({
      success: true,
      message: `Doctor ${id} deleted successfully`,
      deletedCount: delRes.rowCount,
    });
  } catch (err: any) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({ error: 'Failed to delete doctor', details: err?.message });
  }
});

// 13. Create New Wellness Center via Admin Form
adminRouter.post('/admin/wellness', async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      state = 'Maharashtra',
      city = 'Pune',
      area,
      address,
      pincode,
      accreditation,
      overview,
      phone,
      whatsapp,
      website,
      maps_url,
      programs,
      disciplines,
      facilities,
      images,
    } = req.body;

    if (!name || !address || !pincode) {
      return res.status(400).json({
        error: 'Missing required fields',
        detail: 'Name, address, and pincode are required.',
      });
    }

    // Slug and ID generation
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const wellnessId = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)+/g, '');

    // Format tags
    const formattedPrograms = Array.isArray(programs)
      ? programs.map((p: any) => (typeof p === 'string' ? p.trim() : String(p))).filter(Boolean)
      : [];

    const formattedDisciplines = Array.isArray(disciplines)
      ? disciplines.map((d: any) => (typeof d === 'string' ? d.trim() : String(d))).filter(Boolean)
      : [];

    const formattedFacilities = Array.isArray(facilities)
      ? facilities.map((f: any) => (typeof f === 'string' ? f.trim() : String(f))).filter(Boolean)
      : [];

    // Format images
    const formattedImages = Array.isArray(images)
      ? images.map((img: any, idx: number) => ({
          url: typeof img === 'string' ? img : img.url,
          card_url: typeof img === 'string' ? img : img.card_url || img.url,
          alt: typeof img === 'string' ? `${name} photo ${idx + 1}` : img.alt || `${name} campus`,
          caption: typeof img === 'string' ? '' : img.caption || '',
          is_primary: typeof img === 'string' ? idx === 0 : !!img.is_primary,
        }))
      : [];

    const defaultSource = [
      {
        label: `${name} Official Registry`,
        url: website || 'https://ayush.gov.in',
        type: 'official-registry',
        dateChecked: new Date().toISOString().split('T')[0],
      },
    ];

    const insertSql = `
      INSERT INTO wellness_centers (
        id,
        slug,
        name,
        category,
        state,
        city,
        area,
        address,
        pincode,
        accreditation,
        overview,
        website,
        phone,
        whatsapp,
        maps_url,
        verification_status,
        last_checked,
        images,
        programs,
        disciplines,
        facilities,
        sources
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        area = EXCLUDED.area,
        address = EXCLUDED.address,
        pincode = EXCLUDED.pincode,
        accreditation = EXCLUDED.accreditation,
        overview = EXCLUDED.overview,
        website = EXCLUDED.website,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        maps_url = EXCLUDED.maps_url,
        verification_status = EXCLUDED.verification_status,
        last_checked = EXCLUDED.last_checked,
        images = EXCLUDED.images,
        programs = EXCLUDED.programs,
        disciplines = EXCLUDED.disciplines,
        facilities = EXCLUDED.facilities,
        sources = EXCLUDED.sources,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(insertSql, [
      wellnessId,
      baseSlug.slice(0, 128),
      name.slice(0, 255),
      (category || 'Classical Yoga & Scientific Naturopathy').slice(0, 255),
      state.slice(0, 100),
      city.toLowerCase().slice(0, 100),
      (area || city).slice(0, 100),
      address,
      pincode.slice(0, 50),
      accreditation ? accreditation.slice(0, 255) : null,
      overview || null,
      (website || '').slice(0, 255),
      (phone || '').slice(0, 255),
      (whatsapp || phone || '').slice(0, 255),
      maps_url || null,
      'provider-confirmed',
      new Date().toISOString().split('T')[0],
      JSON.stringify(formattedImages),
      JSON.stringify(formattedPrograms),
      JSON.stringify(formattedDisciplines),
      JSON.stringify(formattedFacilities),
      JSON.stringify(defaultSource),
    ]);

    // Store gallery images in images table if any
    if (Array.isArray(formattedImages) && formattedImages.length > 0) {
      for (let i = 0; i < formattedImages.length; i++) {
        const img = formattedImages[i];
        if (!img.url) continue;
        const imgId = `${wellnessId}_img_${i + 1}`;
        await query(
          `INSERT INTO images (id, entity_type, entity_id, object_key, content_hash, url, card_url, full_url, mime_type, sort_order)
           VALUES ($1, 'wellness', $2, $3, $4, $5, $6, $7, 'image/webp', $8)
           ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, card_url = EXCLUDED.card_url`,
          [imgId, wellnessId, img.url, `${wellnessId}_${i}`, img.url, img.card_url || img.url, img.url, i + 1]
        );
      }
    }

    // Invalidate & Reload in-memory store
    await directoryStore.reloadAll();

    return res.status(201).json({
      success: true,
      wellness: result.rows[0],
      message: `Wellness Center "${name}" successfully registered and published!`,
      frontendUrl: `/wellness/${baseSlug}`,
    });
  } catch (err: any) {
    console.error('Error adding wellness center in admin:', err);
    res.status(500).json({ error: 'Failed to create wellness center record', details: err?.message });
  }
});

// 14. Delete Wellness Center by ID
adminRouter.delete('/admin/wellness/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM images WHERE entity_type = $1 AND entity_id = $2', ['wellness', id]);
    const delRes = await query('DELETE FROM wellness_centers WHERE id = $1 RETURNING *', [id]);
    await directoryStore.reloadAll();
    return res.json({
      success: true,
      message: `Wellness center ${id} deleted successfully`,
      deletedCount: delRes.rowCount,
    });
  } catch (err: any) {
    console.error('Error deleting wellness center:', err);
    res.status(500).json({ error: 'Failed to delete wellness center', details: err?.message });
  }
});



