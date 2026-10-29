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
  Trash2,
  ArrowLeft,
  Save,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetHospital, TargetLaboratory } from '../types';
import {
  fetchDoctorById,
  updateDoctor,
  deleteDoctor,
  uploadMultipleEntityImages,
  fetchAllPublicHospitals,
  fetchAllPublicLaboratories,
} from '../api/client';

interface EditDoctorFormProps {
  doctorId: string;
  hospitals?: TargetHospital[];
  laboratories?: TargetLaboratory[];
  onDoctorUpdated: () => void;
  onBack: () => void;
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
  'Cardiology',
  'Orthopaedic Surgery',
  'Neurology',
  'Oncology',
  'Gastroenterology',
  'General Surgery',
  'Nephrology',
  'Urology',
  'Pulmonology',
  'Endocrinology',
  'Pediatrics',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Obstetrics & Gynecology',
  'Rheumatology',
];

const PRESET_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Mandarin',
  'Malay',
  'Tamil',
  'Gujarati',
  'Bengali',
  'Telugu',
  'Kannada',
];

export function EditDoctorForm({
  doctorId,
  hospitals = [],
  laboratories = [],
  onDoctorUpdated,
  onBack,
}: EditDoctorFormProps) {
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [speciality, setSpeciality] = useState('');
  const [department, setDepartment] = useState('');
  const [subSpeciality, setSubSpeciality] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [photo, setPhoto] = useState('');
  const [summary, setSummary] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('provider-confirmed');
  const [lastChecked, setLastChecked] = useState('');
  const [doctorSlug, setDoctorSlug] = useState('');

  // Arrays
  const [languagesList, setLanguagesList] = useState<string[]>([]);
  const [langInput, setLangInput] = useState('');
  const [areasOfPractice, setAreasOfPractice] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');

  // Hospital Affiliations
  const [allHospitals, setAllHospitals] = useState<TargetHospital[]>(hospitals);
  const [hospitalAffiliations, setHospitalAffiliations] = useState<HospitalAffiliationItem[]>([]);
  const [selectedHospToAdd, setSelectedHospToAdd] = useState('');

  // Laboratory Affiliations
  const [allLaboratories, setAllLaboratories] = useState<TargetLaboratory[]>(laboratories);
  const [selectedLabIds, setSelectedLabIds] = useState<string[]>([]);

  // Images
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Load Hospitals if needed
  useEffect(() => {
    if (hospitals.length > 0) {
      setAllHospitals(hospitals);
    } else {
      fetchAllPublicHospitals()
        .then((data) => {
          if (Array.isArray(data)) {
            setAllHospitals(
              data.map((h: any) => ({
                id: h.id,
                slug: h.slug || h.id,
                name: h.name,
                type: 'hospital' as const,
                facilityType: h.facility_type || 'Super-Speciality Tertiary Care',
                city: h.city || '',
                area: h.area || '',
                address: h.address || '',
                pincode: h.pincode || '',
                phone: h.phone || '',
                hasPortalAccount: false,
                portalAccountStatus: 'not_registered' as const,
                dashboardAccessEnabled: false,
                portalEmail: '',
                leadCount: 0,
              }))
            );
          }
        })
        .catch(console.error);
    }
  }, [hospitals]);

  // Load Laboratories if needed
  useEffect(() => {
    if (laboratories.length > 0) {
      setAllLaboratories(laboratories);
    } else {
      fetchAllPublicLaboratories()
        .then((data) => {
          if (Array.isArray(data)) {
            setAllLaboratories(
              data.map((l: any) => ({
                id: l.id,
                slug: l.slug || l.id,
                name: l.name,
                type: 'laboratory' as const,
                facilityType: l.accreditation || 'Diagnostic & Pathology Laboratory',
                city: l.city || '',
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
        .catch(console.error);
    }
  }, [laboratories]);

  // Load Doctor Data
  useEffect(() => {
    let isMounted = true;
    setIsLoadingDoctor(true);
    fetchDoctorById(doctorId)
      .then((doc) => {
        if (!isMounted || !doc) return;
        setName(doc.name || '');
        setTitle(doc.title || 'Consultant Specialist');
        setCity(doc.city || '');
        setArea(doc.area || '');
        setState(doc.state || '');
        setCountry(doc.country || (doc.city === 'singapore' ? 'Singapore' : 'India'));
        setSpeciality(doc.speciality || '');
        setDepartment(doc.department || doc.speciality || '');
        setSubSpeciality(doc.sub_speciality || '');
        setQualifications(doc.qualifications || '');
        setExperienceYears(doc.experience_years ? String(doc.experience_years) : '');
        setPhone(doc.phone || '');
        setWhatsapp(doc.whatsapp || '');
        setPhoto(doc.photo || '');
        setSummary(doc.summary || '');
        setVerificationStatus(doc.verification_status || 'provider-confirmed');
        setLastChecked(doc.last_checked || new Date().toISOString().split('T')[0]);
        setDoctorSlug(doc.slug || '');

        // Languages
        if (Array.isArray(doc.languages)) {
          setLanguagesList(doc.languages);
        }

        // Areas of Practice
        if (Array.isArray(doc.areas_of_practice)) {
          setAreasOfPractice(doc.areas_of_practice);
        }

        // Hospital Affiliations
        if (Array.isArray(doc.hospitals) && doc.hospitals.length > 0) {
          setHospitalAffiliations(
            doc.hospitals.map((aff: any) => ({
              hospital_id: aff.hospital_id,
              hospital_name: aff.hospital_name || aff.hospital_id,
              hospital_city: aff.hospital_city || '',
              days: aff.days || 'Contact our consultant',
              timings: aff.timings || 'Contact our consultant',
              note: aff.note || 'Contact our consultant',
            }))
          );
        } else {
          setHospitalAffiliations([]);
        }

        // Connected Laboratories
        if (Array.isArray(doc.connected_laboratory_ids)) {
          setSelectedLabIds(doc.connected_laboratory_ids);
        }

        // Images gallery
        if (Array.isArray(doc.images)) {
          setImages(doc.images);
        }
      })
      .catch((err) => {
        console.error('Failed to load doctor:', err);
        toast.error(`Error loading doctor: ${err.message}`);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDoctor(false);
      });

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  // Languages handlers
  const handleAddLanguage = (val?: string) => {
    const item = (val || langInput).trim();
    if (item && !languagesList.includes(item)) {
      setLanguagesList([...languagesList, item]);
      if (!val) setLangInput('');
    }
  };

  const handleRemoveLanguage = (item: string) => {
    setLanguagesList(languagesList.filter((l) => l !== item));
  };

  // Areas of practice handlers
  const handleAddArea = (val?: string) => {
    const item = (val || areaInput).trim();
    if (item && !areasOfPractice.includes(item)) {
      setAreasOfPractice([...areasOfPractice, item]);
      if (!val) setAreaInput('');
    }
  };

  const handleRemoveArea = (item: string) => {
    setAreasOfPractice(areasOfPractice.filter((a) => a !== item));
  };

  // Hospital affiliations handlers
  const handleAddHospitalAffiliation = () => {
    if (!selectedHospToAdd) {
      toast.warning('Please select a hospital to add');
      return;
    }
    const found = allHospitals.find((h) => h.id === selectedHospToAdd);
    if (!found) return;

    if (hospitalAffiliations.some((aff) => aff.hospital_id === found.id)) {
      toast.info('This hospital is already in the affiliations list');
      return;
    }

    setHospitalAffiliations([
      ...hospitalAffiliations,
      {
        hospital_id: found.id,
        hospital_name: found.name,
        hospital_city: found.city,
        days: 'Contact our consultant',
        timings: 'Contact our consultant',
        note: 'Contact our consultant',
      },
    ]);
    setSelectedHospToAdd('');
  };

  const handleUpdateAffiliation = (
    index: number,
    field: 'days' | 'timings' | 'note',
    value: string
  ) => {
    setHospitalAffiliations((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveAffiliation = (index: number) => {
    setHospitalAffiliations((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Laboratories toggle
  const handleToggleLab = (labId: string) => {
    setSelectedLabIds((prev) =>
      prev.includes(labId) ? prev.filter((id) => id !== labId) : [...prev, labId]
    );
  };

  // Image Upload handler
  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingImages(true);

    try {
      const result = await uploadMultipleEntityImages(fileList, 'doctors', doctorId);
      if (result && result.images && result.images.length > 0) {
        const newImages: ImageItem[] = result.images.map((img, i) => ({
          url: img.url,
          card_url: img.card_url,
          alt: img.alt || `${name} Photo`,
          caption: img.caption || '',
          is_primary: images.length === 0 && i === 0,
        }));
        setImages((prev) => [...prev, ...newImages]);
        if (!photo && newImages[0]?.url) {
          setPhoto(newImages[0].url);
        }
        toast.success(`Uploaded ${newImages.length} image(s) to Cloudflare R2!`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload image: ' + err.message);
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  // Submit Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Doctor name is required');
      return;
    }
    if (!city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!speciality.trim()) {
      toast.error('Speciality is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        title: title.trim() || 'Consultant Specialist',
        city: city.trim().toLowerCase(),
        area: area.trim(),
        state: state.trim(),
        country: country.trim(),
        speciality: speciality.trim(),
        department: department.trim() || speciality.trim(),
        sub_speciality: subSpeciality.trim(),
        qualifications: qualifications.trim() || 'MBBS',
        experience_years: experienceYears ? parseInt(experienceYears, 10) : undefined,
        languages: languagesList,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        photo: photo.trim(),
        summary: summary.trim(),
        areas_of_practice: areasOfPractice,
        verification_status: verificationStatus.trim(),
        last_checked: lastChecked.trim() || new Date().toISOString().split('T')[0],
        hospital_affiliations: hospitalAffiliations.map((aff) => ({
          hospital_id: aff.hospital_id,
          days: aff.days.trim() || 'Contact our consultant',
          timings: aff.timings.trim() || 'Contact our consultant',
          note: aff.note.trim() || 'Contact our consultant',
        })),
        connected_laboratory_ids: selectedLabIds,
        images: images,
      };

      const res = await updateDoctor(doctorId, payload);
      toast.success(res.message || 'Doctor updated successfully!');
      onDoctorUpdated();
    } catch (err: any) {
      console.error('Update doctor error:', err);
      toast.error(err.message || 'Failed to update doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Doctor
  const handleDelete = async () => {
    const confirmName = window.prompt(
      `Are you sure you want to delete "${name}"?\nType the word "DELETE" to confirm:`
    );
    if (confirmName !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await deleteDoctor(doctorId);
      toast.success(`Doctor "${name}" deleted from database`);
      onDoctorUpdated();
      onBack();
    } catch (err: any) {
      console.error('Delete doctor error:', err);
      toast.error(err.message || 'Failed to delete doctor');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingDoctor) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0077b6] animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading doctor details from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Doctor List</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Editing Doctor ID:</span>
            <code className="text-[11px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
              {doctorId}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {doctorSlug && (
            <a
              href={`http://localhost:3000/doctors/${doctorSlug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View on Live Site</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Doctor'}</span>
          </button>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Basic Identity & Classification */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0077b6] border border-blue-100">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#03045e]">Doctor Identity & Classification</h3>
              <p className="text-xs text-slate-500">
                Primary name, designations, geographical location, and medical hierarchy
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Doctor Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm font-semibold text-slate-800"
              />
            </div>

            {/* Title / Designation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Title / Designation</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Consultant Specialist / Chief Surgeon"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  if (e.target.value === 'Singapore') {
                    setCity('singapore');
                    setState('Singapore');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800 bg-white"
              >
                <option value="India">India</option>
                <option value="Singapore">Singapore</option>
                <option value="Turkey">Turkey</option>
                <option value="Thailand">Thailand</option>
                <option value="Germany">Germany</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra, Karnataka, Singapore"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                City <span className="text-red-500">*</span>{' '}
                <span className="text-[10px] text-slate-400 font-normal">(stored lowercase in DB)</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. pune, mumbai, singapore"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Area / Neighborhood</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Bandra West, Kent Ridge, Shivajinagar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Speciality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Speciality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={speciality}
                onChange={(e) => {
                  setSpeciality(e.target.value);
                  if (!department) setDepartment(e.target.value);
                }}
                placeholder="e.g. Cardiology"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm font-semibold text-slate-800"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {PRESET_SPECIALITIES.slice(0, 6).map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => {
                      setSpeciality(spec);
                      if (!department) setDepartment(spec);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border cursor-pointer transition-all ${
                      speciality.toLowerCase() === spec.toLowerCase()
                        ? 'bg-[#0077b6] text-white border-[#0077b6]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cardiology, Cardiac Sciences"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Sub-Speciality */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Sub-Speciality</label>
              <input
                type="text"
                value={subSpeciality}
                onChange={(e) => setSubSpeciality(e.target.value)}
                placeholder="e.g. Interventional Cardiology, Spine Surgery"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Qualifications</label>
              <input
                type="text"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. MBBS, MD, DM (Cardiology), FACC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience (Years)</label>
              <input
                type="number"
                min="0"
                max="70"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Profile Image, Summary & Languages */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#03045e]">Doctor Profile, Bio & Photo</h3>
              <p className="text-xs text-slate-500">
                Official profile image, clinical summary, and spoken languages
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Summary, Languages, Practice Areas */}
            <div className="lg:col-span-2 space-y-5">
              {/* Summary Paragraph */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Doctor Summary (Clean Text Paragraph)
                </label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide a comprehensive paragraph detailing doctor clinical background, special expertise, and professional achievements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800 leading-relaxed"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Languages Spoken</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLanguage();
                      }
                    }}
                    placeholder="Type language and press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddLanguage()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {languagesList.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {PRESET_LANGUAGES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddLanguage(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400 cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Areas of Practice (Bullet points) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Areas of Practice (Clinical Focus Areas)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddArea();
                      }
                    }}
                    placeholder="Type practice area (e.g. Coronary Angioplasty) and press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddArea()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {areasOfPractice.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0077b6]" />
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArea(item)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {areasOfPractice.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No areas of practice added yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Photo & R2 Upload */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
              <label className="block text-xs font-bold text-slate-700">Doctor Profile Photo</label>

              {/* Photo Preview */}
              <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <ImageIcon className="w-10 h-10 mb-1 opacity-50" />
                    <span className="text-[11px]">No photo set</span>
                  </div>
                )}
              </div>

              {/* Direct Photo URL Input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://... or empty string"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>

              {/* Upload to Cloudflare R2 */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Upload New Image (Cloudflare R2)
                </label>
                <label className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingImages ? 'Uploading...' : 'Choose Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFilesSelected}
                    disabled={isUploadingImages}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Hospital Affiliations (Schedule) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#03045e]">
                  Hospital Affiliations & OPD Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Configure hospital practicing privileges, consulting days, timings, and OPD notes
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {hospitalAffiliations.length} Connected Hospital(s)
            </span>
          </div>

          {/* Add Hospital Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl bg-[#f0f9fc] border border-[#90e0ef]/60">
            <select
              value={selectedHospToAdd}
              onChange={(e) => setSelectedHospToAdd(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            >
              <option value="">-- Select Hospital from Database to Connect --</option>
              {allHospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.city})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddHospitalAffiliation}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Hospital</span>
            </button>
          </div>

          {/* Affiliation Rows */}
          <div className="space-y-4">
            {hospitalAffiliations.map((aff, index) => (
              <div
                key={aff.hospital_id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0077b6]" />
                    <span className="text-sm font-bold text-slate-800">{aff.hospital_name}</span>
                    {aff.hospital_city && (
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                        {aff.hospital_city}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAffiliation(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove affiliation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Days (e.g. Mon - Sat, or 'Contact our consultant')
                    </label>
                    <input
                      type="text"
                      value={aff.days}
                      onChange={(e) => handleUpdateAffiliation(index, 'days', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Timings (e.g. 10:00 AM - 02:00 PM)
                    </label>
                    <input
                      type="text"
                      value={aff.timings}
                      onChange={(e) => handleUpdateAffiliation(index, 'timings', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Note / Prior Appointment
                    </label>
                    <input
                      type="text"
                      value={aff.note}
                      onChange={(e) => handleUpdateAffiliation(index, 'note', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                    />
                  </div>
                </div>
              </div>
            ))}

            {hospitalAffiliations.length === 0 && (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">
                  No hospital affiliations connected. Select a hospital above to add OPD schedule.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Connected Laboratories */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#03045e]">
                  Laboratory Affiliations
                </h3>
                <p className="text-xs text-slate-500">
                  Select partner laboratories connected with this doctor for diagnostics and pathology
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
              {selectedLabIds.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {allLaboratories.map((lab) => {
              const isSelected = selectedLabIds.includes(lab.id);
              return (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => handleToggleLab(lab.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/80 border-purple-300 text-purple-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold truncate">{lab.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{lab.city}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 5: Contact & Verification */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#03045e]">Contact & Verification Details</h3>
              <p className="text-xs text-slate-500">
                Direct coordinator phones, WhatsApp, and official directory verification stamp
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Direct / OPD Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 20 6721 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Number</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 20 6721 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Verification Status</label>
              <input
                type="text"
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
                placeholder="provider-confirmed"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Checked Date</label>
              <input
                type="date"
                value={lastChecked}
                onChange={(e) => setLastChecked(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-lg flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

