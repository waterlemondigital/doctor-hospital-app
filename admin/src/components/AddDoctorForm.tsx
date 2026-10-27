import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Building2,
  FlaskConical,
  MapPin,
  Phone,
  GraduationCap,
  Award,
  Languages,
  CheckCircle2,
  Plus,
  X,
  Upload,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Image as ImageIcon,
  Loader2,
  Calendar,
  Clock,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetHospital, TargetLaboratory } from '../types';
import {
  createDoctor,
  uploadMultipleEntityImages,
  fetchAllPublicHospitals,
  fetchAllPublicLaboratories,
} from '../api/client';

interface AddDoctorFormProps {
  hospitals: TargetHospital[];
  laboratories: TargetLaboratory[];
  onDoctorCreated?: () => void;
}

interface ImageItem {
  url: string;
  card_url?: string;
  alt: string;
  caption?: string;
  is_primary?: boolean;
}

interface HospitalAffiliationItem {
  hospital_id: string;
  hospital_name: string;
  hospital_city?: string;
  days: string;
  timings: string;
  note: string;
}

const PRESET_SPECIALITIES = [
  'Neurology',
  'Cardiology',
  'Orthopaedics',
  'Medical Oncology',
  'Surgical Oncology',
  'Gastroenterology',
  'Paediatrics',
  'Nephrology',
  'Neurosurgery',
  'Pulmonology',
  'General Surgery',
  'ENT',
  'Dermatology',
];

const PRESET_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Tamil',
  'Telugu',
  'Bengali',
];

const PRESET_AREAS_OF_PRACTICE = [
  'Hyperacute Ischaemic Stroke Thrombolysis',
  "Parkinson's Disease & Tremor Disorders",
  'Migraine & Refractory Headache Syndromes',
  'Multiple Sclerosis and Neuro-immunology',
  'Epilepsy & Seizure Management',
  'Interventional Stroke Management',
  'Neuro-Rehabilitation & Mobility',
  'Peripheral Neuropathy & Myasthenia Gravis',
];

export function AddDoctorForm({
  hospitals,
  laboratories,
  onDoctorCreated,
}: AddDoctorFormProps) {
  // Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Senior Consultant Neurologist & Stroke Specialist');
  const [city, setCity] = useState('Pune');
  const [area, setArea] = useState('Deccan Gymkhana');
  const [state, setState] = useState('Maharashtra');
  const [speciality, setSpeciality] = useState('Neurology');
  const [department, setDepartment] = useState('Neurosciences');
  const [subSpeciality, setSubSpeciality] = useState('Acute Stroke Management & Neuro-Rehabilitation');
  const [qualifications, setQualifications] = useState('MBBS, MD (Medicine), DM (Neurology)');
  const [experienceYears, setExperienceYears] = useState<string>('28');
  const [phone, setPhone] = useState('+91 20 6721 5000');
  const [whatsapp, setWhatsapp] = useState('+91 98220 54321');
  const [summary, setSummary] = useState('');

  // Languages Spoken State
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi', 'Marathi', 'Gujarati']);
  const [langInput, setLangInput] = useState('');

  // Areas of Practice State
  const [areasOfPractice, setAreasOfPractice] = useState<string[]>([
    'Hyperacute Ischaemic Stroke Thrombolysis',
    "Parkinson's Disease & Tremor Disorders",
    'Migraine & Refractory Headache Syndromes',
    'Multiple Sclerosis and Neuro-immunology',
  ]);
  const [areaInput, setAreaInput] = useState('');

  // Hospital Affiliations State (Schedule Builder)
  const [allHospitals, setAllHospitals] = useState<TargetHospital[]>(hospitals || []);
  const [hospitalAffiliations, setHospitalAffiliations] = useState<HospitalAffiliationItem[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [affDays, setAffDays] = useState('Mon to Sat');
  const [affTimings, setAffTimings] = useState('11:00 AM - 02:00 PM');
  const [affNote, setAffNote] = useState('Neuro Sciences Clinic, Prior appointment required');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);

  useEffect(() => {
    if (hospitals && hospitals.length > 0) {
      setAllHospitals(hospitals);
      if (!selectedHospitalId && hospitals[0]) {
        setSelectedHospitalId(hospitals[0].id);
      }
    } else {
      setIsLoadingHospitals(true);
      fetchAllPublicHospitals()
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((h) => ({
              id: h.id,
              slug: h.slug || h.id,
              name: h.name,
              type: 'hospital' as const,
              facilityType: h.facility_type || 'Super-Speciality Tertiary Care',
              city: h.city || 'Pune',
              area: h.area || '',
              address: h.address || '',
              pincode: h.pincode || '',
              phone: h.phone || '',
              hasPortalAccount: false,
              portalAccountStatus: 'not_registered' as const,
              dashboardAccessEnabled: false,
              portalEmail: '',
              leadCount: 0,
            }));
            setAllHospitals(mapped);
            if (!selectedHospitalId && mapped[0]) {
              setSelectedHospitalId(mapped[0].id);
            }
          }
        })
        .catch((err) => console.error('Failed to load hospitals list:', err))
        .finally(() => setIsLoadingHospitals(false));
    }
  }, [hospitals]);

  // Connected Laboratories State
  const [allLaboratories, setAllLaboratories] = useState<TargetLaboratory[]>(laboratories || []);
  const [selectedLaboratoryIds, setSelectedLaboratoryIds] = useState<string[]>([]);
  const [labSearch, setLabSearch] = useState('');
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);

  useEffect(() => {
    if (laboratories && laboratories.length > 0) {
      setAllLaboratories(laboratories);
    } else {
      setIsLoadingLabs(true);
      fetchAllPublicLaboratories()
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllLaboratories(
              data.map((l) => ({
                id: l.id,
                slug: l.slug,
                name: l.name,
                type: 'laboratory' as const,
                facilityType: l.accreditation || 'Diagnostic & Pathology Laboratory',
                city: l.city || 'Pune',
                area: l.area || '',
                address: l.address || '',
                pincode: l.pincode || '',
                phone: l.phone || '',
                coverImage: l.images?.[0]?.url || '',
                hasPortalAccount: false,
                portalAccountStatus: 'not_registered' as const,
                dashboardAccessEnabled: false,
                portalEmail: '',
                leadCount: 0,
              }))
            );
          }
        })
        .catch((err) => console.error('Failed to load laboratories list:', err))
        .finally(() => setIsLoadingLabs(false));
    }
  }, [laboratories]);

  // Images State (up to 50 max)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdDoctor, setCreatedDoctor] = useState<{
    name: string;
    slug: string;
    frontendUrl: string;
  } | null>(null);

  // Handlers for Languages
  const handleAddLanguage = (val?: string) => {
    const item = (val || langInput).trim();
    if (item && !languages.includes(item)) {
      setLanguages([...languages, item]);
      if (!val) setLangInput('');
    }
  };

  const handleRemoveLanguage = (item: string) => {
    setLanguages(languages.filter((l) => l !== item));
  };

  // Handlers for Areas of Practice
  const handleAddAreaOfPractice = (val?: string) => {
    const item = (val || areaInput).trim();
    if (item && !areasOfPractice.includes(item)) {
      setAreasOfPractice([...areasOfPractice, item]);
      if (!val) setAreaInput('');
    }
  };

  const handleRemoveAreaOfPractice = (item: string) => {
    setAreasOfPractice(areasOfPractice.filter((a) => a !== item));
  };

  // Handlers for Hospital Affiliation Schedule
  // Instantly connect hospital when chosen from the dropdown
  const handleSelectHospital = (hospId: string) => {
    setSelectedHospitalId(hospId);
    if (!hospId) return;

    const hospitalObj = allHospitals.find((h) => h.id === hospId);
    if (!hospitalObj) return;

    if (!hospitalAffiliations.some((aff) => aff.hospital_id === hospId)) {
      const newAff: HospitalAffiliationItem = {
        hospital_id: hospId,
        hospital_name: hospitalObj.name,
        hospital_city: hospitalObj.city,
        days: affDays || 'Mon to Sat',
        timings: affTimings || '11:00 AM - 02:00 PM',
        note: affNote || 'Prior appointment required',
      };
      setHospitalAffiliations((prev) => [...prev, newAff]);
      toast.success(`Connected ${hospitalObj.name}`, {
        description: `Scheduled: ${newAff.days} (${newAff.timings})`,
      });
    }
  };

  const updateActiveSchedule = (field: 'days' | 'timings' | 'note', value: string) => {
    if (field === 'days') setAffDays(value);
    if (field === 'timings') setAffTimings(value);
    if (field === 'note') setAffNote(value);

    if (selectedHospitalId) {
      setHospitalAffiliations((prev) =>
        prev.map((aff) =>
          aff.hospital_id === selectedHospitalId
            ? { ...aff, [field]: value }
            : aff
        )
      );
    }
  };

  const handleAddHospitalAffiliation = () => {
    if (!selectedHospitalId) {
      toast.error('Please select a hospital to connect');
      return;
    }

    const hospitalObj = allHospitals.find((h) => h.id === selectedHospitalId);
    if (!hospitalObj) return;

    // Check if already affiliated
    if (hospitalAffiliations.some((aff) => aff.hospital_id === selectedHospitalId)) {
      toast.info('Hospital is already in consultation schedule. Updating timings...');
      setHospitalAffiliations((prev) =>
        prev.map((aff) =>
          aff.hospital_id === selectedHospitalId
            ? {
                ...aff,
                days: affDays,
                timings: affTimings,
                note: affNote,
              }
            : aff
        )
      );
      return;
    }

    const newAffiliation: HospitalAffiliationItem = {
      hospital_id: selectedHospitalId,
      hospital_name: hospitalObj.name,
      hospital_city: hospitalObj.city,
      days: affDays || 'Mon to Sat',
      timings: affTimings || '11:00 AM - 02:00 PM',
      note: affNote || 'Prior appointment required',
    };

    setHospitalAffiliations([...hospitalAffiliations, newAffiliation]);
    toast.success(`Connected ${hospitalObj.name}`, {
      description: `Scheduled: ${newAffiliation.days} (${newAffiliation.timings})`,
    });
  };

  const handleRemoveHospitalAffiliation = (hospId: string) => {
    setHospitalAffiliations(hospitalAffiliations.filter((aff) => aff.hospital_id !== hospId));
  };

  // Handlers for Laboratories Affiliations
  const handleToggleLaboratory = (labId: string) => {
    setSelectedLaboratoryIds((prev) =>
      prev.includes(labId) ? prev.filter((id) => id !== labId) : [...prev, labId]
    );
  };

  // Batch Image Upload Handler (up to 50 max)
  const handleMultipleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 50 - images.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum photo limit reached', {
        description: 'You can upload up to 50 photos per doctor profile.',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} photo(s) selected`, {
        description: 'Enforcing 50 images limit per doctor profile.',
      });
    }

    setIsUploadingImages(true);
    setUploadProgress(`Uploading and processing ${filesToUpload.length} photos with Sharp WebP...`);

    try {
      const entityId = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'doctor_batch';
      const res = await uploadMultipleEntityImages(filesToUpload, 'doctors', entityId);

      if (res && res.images && res.images.length > 0) {
        const newImages: ImageItem[] = res.images.map((img, idx) => ({
          url: img.url,
          card_url: img.card_url || img.url,
          alt: img.alt || `${name || 'Doctor'} photo ${images.length + idx + 1}`,
          caption: img.caption || `${name || 'Doctor'} portrait view`,
          is_primary: images.length === 0 && idx === 0,
        }));

        setImages((prev) => [...prev, ...newImages]);
        toast.success(`Successfully uploaded ${newImages.length} photo(s) to Cloudflare R2`, {
          description: 'Optimized full and card WebP variants generated.',
        });
      }
    } catch (err: any) {
      console.error('Batch upload error:', err);
      toast.error('Image upload failed', {
        description: err.message || 'Could not upload files to Cloudflare R2.',
      });
    } finally {
      setIsUploadingImages(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (prev[index]?.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
    toast.info('Primary profile photo updated', {
      description: 'This photo will appear in the main doctor avatar and search cards.',
    });
  };

  // Template Loader: Dr. Sudhir Kothari (from docs.md)
  const handleLoadDoctorTemplate = () => {
    setName('Dr. Sudhir Kothari');
    setTitle('Senior Consultant Neurologist & Stroke Specialist');
    setCity('Pune');
    setArea('Deccan Gymkhana');
    setState('Maharashtra');
    setSpeciality('Neurology');
    setDepartment('Neurosciences');
    setSubSpeciality('Acute Stroke Management & Neuro-Rehabilitation');
    setQualifications('MBBS, MD (Medicine), DM (Neurology)');
    setExperienceYears('28');
    setLanguages(['English', 'Hindi', 'Marathi', 'Gujarati']);
    setPhone('+91 20 6721 5000');
    setWhatsapp('+91 98220 54321');
    setSummary(
      "Dr. Sudhir Kothari is a senior neurologist with nearly three decades of clinical practice across Western Maharashtra. He is widely recognized for his work in establishing hyperacute stroke thrombolysis protocols and advanced management of Parkinson's disease."
    );

    setAreasOfPractice([
      'Hyperacute Ischaemic Stroke Thrombolysis',
      "Parkinson's Disease & Tremor Disorders",
      'Migraine & Refractory Headache Syndromes',
      'Multiple Sclerosis and Neuro-immunology',
    ]);

    // Pre-match Sahyadri Super Speciality Hospital
    const sahyadri = allHospitals.find((h) => h.name.toLowerCase().includes('sahyadri'));
    if (sahyadri) {
      setSelectedHospitalId(sahyadri.id);
      setAffDays('Mon to Sat');
      setAffTimings('11:00 AM - 02:00 PM');
      setAffNote('Neuro Sciences Clinic, Prior appointment required');
      setHospitalAffiliations([
        {
          hospital_id: sahyadri.id,
          hospital_name: sahyadri.name,
          hospital_city: sahyadri.city,
          days: 'Mon to Sat',
          timings: '11:00 AM - 02:00 PM',
          note: 'Neuro Sciences Clinic, Prior appointment required',
        },
      ]);
    }

    // Pre-match Apollo Diagnostics Central Reference Laboratory
    const apolloLab = allLaboratories.find((l) => l.name.toLowerCase().includes('apollo'));
    if (apolloLab) {
      setSelectedLaboratoryIds([apolloLab.id]);
    }

    toast.success('Loaded Dr. Sudhir Kothari Template', {
      description: 'Populated with verified reference values from docs.md.',
    });
  };

  const handleResetForm = () => {
    setName('');
    setTitle('Senior Consultant Neurologist & Stroke Specialist');
    setCity('Pune');
    setArea('');
    setState('Maharashtra');
    setSpeciality('Neurology');
    setDepartment('Neurosciences');
    setSubSpeciality('');
    setQualifications('MBBS, MD');
    setExperienceYears('15');
    setLanguages(['English', 'Hindi']);
    setPhone('+91 20 6721 5000');
    setWhatsapp('+91 20 6721 5000');
    setSummary('');
    setAreasOfPractice([]);
    setHospitalAffiliations([]);
    setSelectedLaboratoryIds([]);
    setImages([]);
    setCreatedDoctor(null);
    toast.info('Form reset to blank state');
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Doctor Name is required');
      return;
    }
    if (!city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!speciality.trim()) {
      toast.error('Clinical Speciality is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderedImages = [...images].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return 0;
      });

      const primaryPhoto = orderedImages[0]?.url || '';

      const payload = {
        name: name.trim(),
        title: title.trim(),
        city: city.trim(),
        area: area.trim() || city.trim(),
        state: state.trim() || 'Maharashtra',
        speciality: speciality.trim(),
        department: department.trim() || speciality.trim(),
        sub_speciality: subSpeciality.trim(),
        qualifications: qualifications.trim(),
        experience_years: experienceYears ? parseInt(experienceYears, 10) : undefined,
        languages,
        phone: phone ? phone.trim() : '',
        whatsapp: whatsapp ? whatsapp.trim() : '',
        summary: summary.trim(),
        areas_of_practice: areasOfPractice,
        photo: primaryPhoto,
        images: orderedImages,
        // Auto-merge currently active dropdown selection if user forgot to click the "+ Add" button
        hospital_affiliations: (() => {
          const list = [...hospitalAffiliations];
          if (
            selectedHospitalId &&
            !list.some((aff) => aff.hospital_id === selectedHospitalId)
          ) {
            list.push({
              hospital_id: selectedHospitalId,
              hospital_name: allHospitals.find((h) => h.id === selectedHospitalId)?.name || selectedHospitalId,
              hospital_city: allHospitals.find((h) => h.id === selectedHospitalId)?.city || '',
              days: affDays || 'Mon to Sat',
              timings: affTimings || '11:00 AM - 02:00 PM',
              note: affNote || 'Prior appointment required',
            });
          }
          return list.map((aff) => ({
            hospital_id: aff.hospital_id,
            days: aff.days,
            timings: aff.timings,
            note: aff.note,
          }));
        })(),
        connected_laboratory_ids: selectedLaboratoryIds,
      };

      const result = await createDoctor(payload);

      if (result.success) {
        toast.success(`Doctor "${name}" published successfully!`, {
          description: 'Live in directory and connected with hospital schedules.',
        });

        setCreatedDoctor({
          name: result.doctor.name || name,
          slug: result.doctor.slug,
          frontendUrl: result.frontendUrl || `/doctors/${result.doctor.slug}`,
        });

        if (onDoctorCreated) {
          onDoctorCreated();
        }
      }
    } catch (err: any) {
      console.error('Error submitting doctor:', err);
      toast.error('Failed to create doctor record', {
        description: err.message || 'Please check input data and network connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Hospitals for schedule dropdown
  const filteredHospitals = allHospitals.filter((h) => {
    if (!hospitalSearch.trim()) return true;
    const q = hospitalSearch.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      (h.area && h.area.toLowerCase().includes(q))
    );
  });

  // Filtered Laboratories for picker
  const filteredLaboratories = allLaboratories.filter((l) => {
    if (!labSearch.trim()) return true;
    const q = labSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      (l.area && l.area.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Action Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-[#0077b6]">
              Doctor & Specialist Ingestion
            </span>
            <span className="text-xs text-slate-400 font-medium">•</span>
            <span className="text-xs font-semibold text-slate-600">PostgreSQL + Cloudflare R2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#03045e] tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-[#0077b6]" />
            <span>Add Doctor (Hospital Connected)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Publish verified medical faculty, qualifications, OPD consultation schedules at affiliated hospitals, and diagnostic links.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleLoadDoctorTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-[#0077b6] hover:bg-blue-100 border border-blue-200/80 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0077b6]" />
            <span>Load Dr. Sudhir Kothari Template</span>
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {createdDoctor && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-emerald-950">
                Doctor Registered: {createdDoctor.name}
              </h4>
              <p className="text-xs text-emerald-800">
                The doctor has been stored in Neon PostgreSQL, hospital schedules connected, and indexed in the cache.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`http://localhost:3000${createdDoctor.frontendUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold transition-colors shadow-2xs"
            >
              <span>View Doctor Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setCreatedDoctor(null)}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Specialist Identity & Medical Credentials */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0077b6] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Specialist Identity & Clinical Qualifications
              </h3>
              <p className="text-xs text-slate-500">Doctor full name, designation, qualifications, and medical speciality.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">
                Doctor Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Sudhir Kothari"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Experience (Years)</label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  max="70"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">
                Professional Title / Role
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Consultant Neurologist & Stroke Specialist"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Medical Qualifications <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. MBBS, MD (Medicine), DM (Neurology)"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>
            </div>

            {/* Speciality & Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Primary Clinical Speciality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                placeholder="e.g. Neurology"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
              <div className="flex items-center gap-1 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                {PRESET_SPECIALITIES.slice(0, 5).map((spec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSpeciality(spec);
                      if (!department || department === 'General') setDepartment(spec);
                    }}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-[#0077b6] hover:bg-blue-100 cursor-pointer"
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Neurosciences"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Sub-Speciality / Focus</label>
              <input
                type="text"
                value={subSpeciality}
                onChange={(e) => setSubSpeciality(e.target.value)}
                placeholder="e.g. Acute Stroke Management & Neuro-Rehabilitation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>
          </div>
        </div>

        {/* 2. Consultation Location & Communication */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Consultation Location & Practice Region
              </h3>
              <p className="text-xs text-slate-500">Base clinic locality and city coordinates (Phone & WhatsApp inquiries are managed centrally on frontend).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Area / Locality</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Deccan Gymkhana"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>
          </div>
        </div>

        {/* 3. Languages Spoken & Clinical Summary */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Languages Spoken & Professional Summary
              </h3>
              <p className="text-xs text-slate-500">Patient communication languages and clinical narrative overview.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Languages Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Languages Spoken ({languages.length})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                  placeholder="Type language and press Enter (e.g. Marathi)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                />
                <button
                  type="button"
                  onClick={() => handleAddLanguage()}
                  className="px-3.5 py-2 rounded-xl bg-[#0077b6] text-white hover:bg-[#005f92] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_LANGUAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddLanguage(preset)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-800 cursor-pointer transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {languages.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-semibold"
                  >
                    <Languages className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(item)}
                      className="p-0.5 rounded-full hover:bg-amber-200 text-amber-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Narrative Summary */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-slate-700">
                Professional Overview / Biography
              </label>
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Dr. Sudhir Kothari is a senior neurologist with nearly three decades of clinical practice across Western Maharashtra. He is widely recognized for his work in establishing hyperacute stroke thrombolysis protocols and advanced management of Parkinson's disease."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Factual overview, qualifications, and patient care ethos</span>
                <span>{summary.length} characters</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Areas of Practice & Clinical Specialisations */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                  Key Areas of Practice & Clinical Procedures ({areasOfPractice.length})
                </h3>
                <p className="text-xs text-slate-500">Core clinical domains, surgical expertise, and therapeutic procedures.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAreaOfPractice())}
                placeholder="Type clinical domain and press Enter (e.g. Hyperacute Ischaemic Stroke Thrombolysis)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
              <button
                type="button"
                onClick={() => handleAddAreaOfPractice()}
                className="px-3.5 py-2 rounded-xl bg-[#0077b6] text-white hover:bg-[#005f92] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_AREAS_OF_PRACTICE.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddAreaOfPractice(preset)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200/60 cursor-pointer transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {areasOfPractice.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/80 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAreaOfPractice(item)}
                    className="p-0.5 rounded-full hover:bg-purple-200 text-purple-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Hospital Affiliations & OPD Consulting Schedule (Schedule Builder) */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0077b6] flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Hospital Affiliations & OPD Consulting Schedule ({hospitalAffiliations.length} connected)
              </h3>
              <p className="text-xs text-slate-500">
                Connect hospitals from the database and configure outpatient days, consultation hours, and clinic notes.
              </p>
            </div>
          </div>

          {/* Affiliation Builder Form */}
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#03045e]">
              Connect a Hospital & Configure Schedule
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hospital Dropdown */}
              <div className="space-y-1 md:col-span-3">
                <label className="block text-xs font-bold text-slate-700">
                  Select Hospital from Database
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={hospitalSearch}
                    onChange={(e) => setHospitalSearch(e.target.value)}
                    placeholder="Search hospitals by name or city..."
                    className="sm:w-1/3 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  />
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => handleSelectHospital(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#03045e] bg-white"
                  >
                    <option value="">-- Choose Hospital to Affiliate --</option>
                    {filteredHospitals.map((hosp) => (
                      <option key={hosp.id} value={hosp.id}>
                        {hosp.name} ({hosp.area ? `${hosp.area}, ` : ''}{hosp.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Consultation Days */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">OPD Days</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={affDays}
                    onChange={(e) => updateActiveSchedule('days', e.target.value)}
                    placeholder="e.g. Mon to Sat"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Consultation Timings */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Consultation Timings</label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={affTimings}
                    onChange={(e) => updateActiveSchedule('timings', e.target.value)}
                    placeholder="e.g. 11:00 AM - 02:00 PM"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  />
                </div>
              </div>

              {/* Consultation Note */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Advisory Note</label>
                <input
                  type="text"
                  value={affNote}
                  onChange={(e) => updateActiveSchedule('note', e.target.value)}
                  placeholder="e.g. Neuro Sciences Clinic, Prior appointment required"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddHospitalAffiliation}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0077b6] text-white hover:bg-[#005f92] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add / Update Hospital Affiliation</span>
              </button>
            </div>
          </div>

          {/* Active Connected Hospitals Cards */}
          {hospitalAffiliations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {hospitalAffiliations.map((aff, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-blue-200 bg-white p-4 space-y-2.5 shadow-2xs relative group hover:border-[#0077b6] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#0077b6]" />
                        <h5 className="text-xs font-extrabold text-[#03045e]">
                          {aff.hospital_name}
                        </h5>
                      </div>
                      {aff.hospital_city && (
                        <p className="text-[10px] text-slate-500">{aff.hospital_city}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveHospitalAffiliation(aff.hospital_id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove Affiliation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 font-medium">Days:</span>{' '}
                      <strong className="text-slate-700">{aff.days}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Timings:</span>{' '}
                      <strong className="text-slate-700">{aff.timings}</strong>
                    </div>
                  </div>

                  {aff.note && (
                    <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200/60">
                      <strong>Note:</strong> {aff.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
              No hospital affiliations added yet. Connect at least one hospital from the selector above.
            </div>
          )}
        </div>

        {/* 6. Connected Laboratories */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                  Connected Laboratories ({selectedLaboratoryIds.length} selected)
                </h3>
                <p className="text-xs text-slate-500">
                  Select pathology diagnostic laboratories where this specialist refers patients or verifies specimen panels.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Selected Chips */}
            {selectedLaboratoryIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-purple-50/60 border border-purple-200/80">
                {selectedLaboratoryIds.map((id) => {
                  const lab = allLaboratories.find((l) => l.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-xs font-bold text-purple-950 shadow-2xs"
                    >
                      <FlaskConical className="w-3 h-3 text-purple-600" />
                      <span>{lab?.name || id}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleLaboratory(id)}
                        className="hover:text-red-600 p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Search and Selector */}
            <input
              type="text"
              value={labSearch}
              onChange={(e) => setLabSearch(e.target.value)}
              placeholder="Search laboratories by name or city..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
            />

            <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/40">
              {isLoadingLabs ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading laboratories...</div>
              ) : filteredLaboratories.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No matching laboratories found</div>
              ) : (
                filteredLaboratories.map((lab) => {
                  const isSelected = selectedLaboratoryIds.includes(lab.id);
                  return (
                    <div
                      key={lab.id}
                      onClick={() => handleToggleLaboratory(lab.id)}
                      className={`p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-100/70 font-semibold' : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-purple-950 truncate">{lab.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {lab.city} {lab.facilityType ? `• ${lab.facilityType}` : ''}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 7. Doctor Profile Photos & Media Gallery (Up to 50 Images Max) */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-xs">
                7
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                  Doctor Profile Photos & Media Gallery ({images.length} of 50 uploaded)
                </h3>
                <p className="text-xs text-slate-500">
                  Multiple image batch uploader. The primary photo is set as the doctor profile avatar.
                </p>
              </div>
            </div>

            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setImages([])}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Photos</span>
              </button>
            )}
          </div>

          {/* Multiple File Upload Dropzone */}
          <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-violet-600 flex items-center justify-center mx-auto border border-violet-100">
              {isUploadingImages ? (
                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="multi-doctor-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Select Doctor Photos (Up to 50 max)</span>
              </label>
              <input
                id="multi-doctor-file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={isUploadingImages}
                onChange={handleMultipleImageFiles}
                className="hidden"
              />
              <p className="text-[11px] text-slate-500">
                Supports JPG, PNG, WEBP. Maximum 50 images per doctor profile.
              </p>
            </div>

            {uploadProgress && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-100 text-violet-800 text-xs font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{uploadProgress}</span>
              </div>
            )}
          </div>

          {/* Uploaded Photos Grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-2xl border overflow-hidden bg-slate-100 shadow-2xs transition-all ${
                    img.is_primary ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={img.card_url || img.url}
                    alt={img.alt || `Photo ${idx + 1}`}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges / Overlay */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    {img.is_primary && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black tracking-wide shadow-xs flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Profile Avatar</span>
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-semibold backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      title="Set as Primary Profile Photo"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                        img.is_primary
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/90 text-slate-800 hover:bg-amber-400 hover:text-white'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      title="Remove Photo"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
              No photos uploaded yet. Select images above to populate the doctor profile photo and gallery.
            </div>
          )}
        </div>

        {/* Submit Action Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Clicking publish inserts into Neon PostgreSQL <code className="text-slate-700 font-bold">doctors</code> table and establishes relational hospital affiliations.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetForm}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-xs font-black transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Doctor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Doctor to Directory</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
