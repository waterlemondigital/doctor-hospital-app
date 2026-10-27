import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Building2,
  MapPin,
  Phone,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Plus,
  X,
  Upload,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Stethoscope,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileText,
  Star,
  Trash2,
  Home,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetHospital, TargetDoctor } from '../types';
import {
  createLaboratory,
  uploadMultipleEntityImages,
  fetchAllPublicHospitals,
  fetchAllPublicDoctors,
} from '../api/client';

interface AddLaboratoryFormProps {
  hospitals: TargetHospital[];
  doctors: TargetDoctor[];
  onLaboratoryCreated?: () => void;
}

interface ImageItem {
  url: string;
  card_url?: string;
  alt: string;
  caption?: string;
  is_primary?: boolean;
}

const PRESET_ACCREDITATIONS = [
  'NABL & CAP Accredited Laboratory',
  'NABL Accredited Reference Laboratory',
  'ISO 15189 Certified Medical Laboratory',
  'ICMR Approved Diagnostic Center',
  'NABL Certified Clinical Pathology Wing',
];

const PRESET_SERVICES = [
  '24x7 Emergency Blood & Fluid Profiling',
  'Home Sample Phlebotomy Collection Across Pune',
  'Comprehensive Metabolic, Liver & Lipid Panels',
  'Real-Time PCR & Molecular Viral Diagnostics',
  'Oncology Tumour Markers & Biopsy Histopathology',
  'Digital Real-Time Reports with QR Verification',
  'Complete Hemogram & CBC Profiling',
  'Thyroid & Endocrine Hormone Screening',
  'Infectious Disease Serology & ELISA Testing',
  'Full Body Master Health Checkup Packages',
];

const PRESET_DEPARTMENTS = [
  'Clinical Biochemistry',
  'Microbiology & Serology',
  'Histopathology & Cytology',
  'Molecular Genetics & Genomics',
  'Hematology & Clinical Pathology',
  'Immunology & Allergy Profiling',
  'Flow Cytometry & Cytogenetics',
  'Endocrinology & Immunoassays',
];

const PRESET_FACILITIES = [
  'NABL & CAP Certified Quality Testing',
  'Automated Roche Cobas Integrated Track Analyzers',
  'Temperature-Controlled Cold-Chain Specimen Transport',
  'Patient Lounge & Express Phlebotomy Desks',
  'Barcoded Tube Tracking with Zero Misidentification',
  'Digital Report Delivery via WhatsApp & Portal',
  'Dedicated Sample Drop-off Kiosk 24x7',
  'External Quality Assurance System (EQAS) Validated',
];

export function AddLaboratoryForm({
  hospitals,
  doctors,
  onLaboratoryCreated,
}: AddLaboratoryFormProps) {
  // Form State
  const [name, setName] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('Pune');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [accreditation, setAccreditation] = useState('NABL & CAP Accredited Laboratory');
  const [homeSampleCollection, setHomeSampleCollection] = useState(true);
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [phone, setPhone] = useState('+91 20 4444 2424');
  const [whatsapp, setWhatsapp] = useState('+91 91234 56780');
  const [website, setWebsite] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [overview, setOverview] = useState('');

  // Lists State
  const [services, setServices] = useState<string[]>([
    '24x7 Emergency Blood & Fluid Profiling',
    'Home Sample Phlebotomy Collection Across Pune',
    'Comprehensive Metabolic, Liver & Lipid Panels',
    'Real-Time PCR & Molecular Viral Diagnostics',
    'Oncology Tumour Markers & Biopsy Histopathology',
    'Digital Real-Time Reports with QR Verification',
  ]);
  const [serviceInput, setServiceInput] = useState('');

  const [departments, setDepartments] = useState<string[]>([
    'Clinical Biochemistry',
    'Microbiology & Serology',
    'Histopathology & Cytology',
    'Molecular Genetics & Genomics',
  ]);
  const [deptInput, setDeptInput] = useState('');

  const [facilities, setFacilities] = useState<string[]>([
    'NABL & CAP Certified Quality Testing',
    'Automated Roche Cobas Integrated Track Analyzers',
    'Temperature-Controlled Cold-Chain Specimen Transport',
    'Patient Lounge & Express Phlebotomy Desks',
  ]);
  const [facilityInput, setFacilityInput] = useState('');

  // Affiliations - Connected Hospitals
  const [allHospitals, setAllHospitals] = useState<TargetHospital[]>(hospitals || []);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([]);
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);

  useEffect(() => {
    if (hospitals && hospitals.length > 0) {
      setAllHospitals(hospitals);
    } else {
      setIsLoadingHospitals(true);
      fetchAllPublicHospitals()
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllHospitals(
              data.map((h) => ({
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
              }))
            );
          }
        })
        .catch((err) => console.error('Failed to load hospitals list:', err))
        .finally(() => setIsLoadingHospitals(false));
    }
  }, [hospitals]);

  // Affiliations - Connected Doctors
  const [allDoctors, setAllDoctors] = useState<TargetDoctor[]>(doctors || []);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorSpecialityFilter, setDoctorSpecialityFilter] = useState('all');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      setAllDoctors(doctors);
    } else {
      setIsLoadingDoctors(true);
      fetchAllPublicDoctors()
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllDoctors(
              data.map((d) => ({
                id: d.id,
                slug: d.slug || d.id,
                name: d.name,
                type: 'doctor' as const,
                title: d.title || 'Consultant Specialist',
                speciality: d.speciality || 'General Medicine',
                department: d.department || d.speciality || 'General Medicine',
                city: d.city || 'Pune',
                area: d.area || '',
                phone: d.phone || '',
                whatsapp: d.whatsapp || '',
                photo: d.photo || '',
                experienceYears: d.experience_years ? `${d.experience_years} years` : '',
                qualifications: d.qualifications || '',
                hasPortalAccount: false,
                portalAccountStatus: 'not_registered' as const,
                dashboardAccessEnabled: false,
                portalEmail: '',
                leadCount: 0,
              }))
            );
          }
        })
        .catch((err) => console.error('Failed to load doctors list:', err))
        .finally(() => setIsLoadingDoctors(false));
    }
  }, [doctors]);

  // Images state (up to 50 max)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLab, setCreatedLab] = useState<{
    name: string;
    slug: string;
    frontendUrl: string;
  } | null>(null);

  // Tag Handlers
  const handleAddService = (val?: string) => {
    const item = (val || serviceInput).trim();
    if (item && !services.includes(item)) {
      setServices([...services, item]);
      if (!val) setServiceInput('');
    }
  };

  const handleRemoveService = (item: string) => {
    setServices(services.filter((s) => s !== item));
  };

  const handleAddDept = (val?: string) => {
    const item = (val || deptInput).trim();
    if (item && !departments.includes(item)) {
      setDepartments([...departments, item]);
      if (!val) setDeptInput('');
    }
  };

  const handleRemoveDept = (item: string) => {
    setDepartments(departments.filter((d) => d !== item));
  };

  const handleAddFacility = (val?: string) => {
    const item = (val || facilityInput).trim();
    if (item && !facilities.includes(item)) {
      setFacilities([...facilities, item]);
      if (!val) setFacilityInput('');
    }
  };

  const handleRemoveFacility = (item: string) => {
    setFacilities(facilities.filter((f) => f !== item));
  };

  // Multiple Batch Image Upload Handler (up to 50 images)
  const handleMultipleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 50 - images.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum photo limit reached', {
        description: 'You can upload up to 50 photos per laboratory.',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} photo(s) selected`, {
        description: 'Enforcing 50 images limit per laboratory.',
      });
    }

    setIsUploadingImages(true);
    setUploadProgress(`Uploading and processing ${filesToUpload.length} photos with Sharp WebP...`);

    try {
      const entityId = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'lab_batch';
      const res = await uploadMultipleEntityImages(filesToUpload, 'laboratories', entityId);

      if (res && res.images && res.images.length > 0) {
        const newImages: ImageItem[] = res.images.map((img, idx) => ({
          url: img.url,
          card_url: img.card_url || img.url,
          alt: img.alt || `${name || 'Laboratory'} photo ${images.length + idx + 1}`,
          caption: img.caption || `${name || 'Laboratory'} facility view`,
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
    toast.info('Primary cover photo updated', {
      description: 'This photo will appear first on laboratory listing cards.',
    });
  };

  // Affiliation Toggles
  const handleToggleHospital = (hospitalId: string) => {
    setSelectedHospitalIds((prev) =>
      prev.includes(hospitalId) ? prev.filter((id) => id !== hospitalId) : [...prev, hospitalId]
    );
  };

  const handleToggleDoctor = (doctorId: string) => {
    setSelectedDoctorIds((prev) =>
      prev.includes(doctorId) ? prev.filter((id) => id !== doctorId) : [...prev, doctorId]
    );
  };

  // Template loader: Apollo Diagnostics Central Reference Laboratory (from labs.md)
  const handleLoadApolloTemplate = () => {
    setName('Apollo Diagnostics Central Reference Laboratory');
    setState('Maharashtra');
    setCity('Pune');
    setArea('Shivajinagar');
    setAddress('ICC Trade Tower, Senapati Bapat Road, Shivajinagar, Pune');
    setPincode('411016');
    setAccreditation('NABL & CAP Accredited Laboratory');
    setHomeSampleCollection(true);
    setEmergencyAvailable(true);
    setPhone('+91 20 4444 2424');
    setWhatsapp('+91 91234 56780');
    setWebsite('https://apollodiagnostics.in');
    setMapsUrl('https://maps.google.com/?q=Apollo+Diagnostics+ICC+Trade+Tower+Pune');
    setOverview(
      'Apollo Diagnostics Central Reference Laboratory is a regional pathology reference center featuring automated robotic clinical chemistry, molecular diagnostics, real-time PCR, histopathology, and comprehensive home sample collection throughout Pune.'
    );

    setServices([
      '24x7 Emergency Blood & Fluid Profiling',
      'Home Sample Phlebotomy Collection Across Pune',
      'Comprehensive Metabolic, Liver & Lipid Panels',
      'Real-Time PCR & Molecular Viral Diagnostics',
      'Oncology Tumour Markers & Biopsy Histopathology',
      'Digital Real-Time Reports with QR Verification',
    ]);

    setDepartments([
      'Clinical Biochemistry',
      'Microbiology & Serology',
      'Histopathology & Cytology',
      'Molecular Genetics & Genomics',
    ]);

    setFacilities([
      'NABL & CAP Certified Quality Testing',
      'Automated Roche Cobas Integrated Track Analyzers',
      'Temperature-Controlled Cold-Chain Specimen Transport',
      'Patient Lounge & Express Phlebotomy Desks',
    ]);

    // Pre-match Connected Hospitals: Sahyadri Super Speciality Hospital, Sassoon General Hospital
    const matchingHospitalIds = allHospitals
      .filter((h) => {
        const hName = h.name.toLowerCase();
        return hName.includes('sahyadri') || hName.includes('sassoon');
      })
      .map((h) => h.id);
    if (matchingHospitalIds.length > 0) {
      setSelectedHospitalIds(matchingHospitalIds);
    }

    // Pre-match Connected Doctors: Dr. Charulata Bapaye, Dr. Sudhir Kothari
    const matchingDoctorIds = allDoctors
      .filter((d) => {
        const dName = d.name.toLowerCase();
        return dName.includes('bapaye') || dName.includes('kothari');
      })
      .map((d) => d.id);
    if (matchingDoctorIds.length > 0) {
      setSelectedDoctorIds(matchingDoctorIds);
    }

    toast.success('Loaded Apollo Diagnostics Template', {
      description: 'Populated with verified reference values from labs.md.',
    });
  };

  const handleResetForm = () => {
    setName('');
    setState('Maharashtra');
    setCity('Pune');
    setArea('');
    setAddress('');
    setPincode('');
    setAccreditation('NABL & CAP Accredited Laboratory');
    setHomeSampleCollection(true);
    setEmergencyAvailable(true);
    setPhone('+91 20 4444 2424');
    setWhatsapp('+91 91234 56780');
    setWebsite('');
    setMapsUrl('');
    setOverview('');
    setServices([
      '24x7 Emergency Blood & Fluid Profiling',
      'Home Sample Phlebotomy Collection Across Pune',
      'Comprehensive Metabolic, Liver & Lipid Panels',
    ]);
    setDepartments(['Clinical Biochemistry', 'Microbiology & Serology', 'Histopathology & Cytology']);
    setFacilities(['NABL & CAP Certified Quality Testing', 'Patient Lounge & Express Phlebotomy Desks']);
    setSelectedHospitalIds([]);
    setSelectedDoctorIds([]);
    setImages([]);
    setCreatedLab(null);
    toast.info('Form reset to blank state');
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Laboratory Name is required');
      return;
    }
    if (!city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Street Address is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Re-order images so primary is first
      const orderedImages = [...images].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return 0;
      });

      const payload = {
        name: name.trim(),
        city: city.trim(),
        area: area.trim() || city.trim(),
        state: state.trim() || 'Maharashtra',
        address: address.trim(),
        pincode: pincode.trim(),
        accreditation: accreditation.trim(),
        home_sample_collection: homeSampleCollection,
        emergency_available_24x7: emergencyAvailable,
        phone: phone ? phone.trim() : '',
        whatsapp: whatsapp ? whatsapp.trim() : '',
        website: website.trim(),
        maps_url: mapsUrl.trim(),
        overview: overview.trim(),
        services,
        departments,
        facilities,
        images: orderedImages,
        connected_hospital_ids: selectedHospitalIds,
        connected_doctor_ids: selectedDoctorIds,
      };

      const result = await createLaboratory(payload);

      if (result.success) {
        toast.success(`Laboratory "${name}" published successfully!`, {
          description: 'Live in directory and connected with affiliations.',
        });

        setCreatedLab({
          name: result.laboratory.name || name,
          slug: result.laboratory.slug,
          frontendUrl: result.frontendUrl || `/laboratories/${result.laboratory.slug}`,
        });

        if (onLaboratoryCreated) {
          onLaboratoryCreated();
        }
      }
    } catch (err: any) {
      console.error('Error submitting laboratory:', err);
      toast.error('Failed to create laboratory', {
        description: err.message || 'Please check input data and network connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Hospital list for picker
  const filteredHospitals = allHospitals.filter((h) => {
    if (!hospitalSearch.trim()) return true;
    const q = hospitalSearch.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      (h.area && h.area.toLowerCase().includes(q))
    );
  });

  // Filtered Doctor list for picker
  const filteredDoctors = allDoctors.filter((d) => {
    const matchesSearch =
      !doctorSearch.trim() ||
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      d.speciality.toLowerCase().includes(doctorSearch.toLowerCase());

    const matchesSpec =
      doctorSpecialityFilter === 'all' ||
      d.speciality.toLowerCase().includes(doctorSpecialityFilter.toLowerCase());

    return matchesSearch && matchesSpec;
  });

  const availableSpecialities = Array.from(
    new Set(allDoctors.map((d) => d.speciality).filter(Boolean))
  );

  return (
    <div className="space-y-8">
      {/* Action Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
              Diagnostic Directory Entry
            </span>
            <span className="text-xs text-slate-400 font-medium">•</span>
            <span className="text-xs font-semibold text-slate-600">PostgreSQL + Cloudflare R2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#03045e] tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-purple-600" />
            <span>Add Diagnostic Laboratory</span>
          </h2>
          <p className="text-xs text-slate-500">
            Publish an accredited pathology or reference lab with verified test categories, sample collection, and affiliated hospital networks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleLoadApolloTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Load Apollo Diagnostics Template</span>
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
      {createdLab && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-emerald-950">
                Laboratory Registered: {createdLab.name}
              </h4>
              <p className="text-xs text-emerald-800">
                The laboratory has been stored in Neon PostgreSQL, affiliations connected, and indexed in the cache.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`http://localhost:3000${createdLab.frontendUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold transition-colors shadow-2xs"
            >
              <span>View Laboratory Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setCreatedLab(null)}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Core Identity & Accreditation */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Diagnostic Center Identity & Quality Accreditation
              </h3>
              <p className="text-xs text-slate-500">Official trade name and statutory accreditation standards.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700">
                Laboratory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apollo Diagnostics Central Reference Laboratory"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6] focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Accreditation Badge Text
              </label>
              <input
                type="text"
                value={accreditation}
                onChange={(e) => setAccreditation(e.target.value)}
                placeholder="e.g. NABL & CAP Accredited Laboratory"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Quick presets:</span>
                {PRESET_ACCREDITATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAccreditation(preset)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/50 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Capabilities Toggles */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Diagnostic Service Capabilities
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                {/* Home Sample Collection Toggle */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={homeSampleCollection}
                    onChange={(e) => setHomeSampleCollection(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Home className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Home Phlebotomy</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Doorstep blood & fluid sample collection available.
                    </p>
                  </div>
                </label>

                {/* 24x7 Emergency Services Toggle */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={emergencyAvailable}
                    onChange={(e) => setEmergencyAvailable(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>24x7 Emergency Profiling</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Critical care & urgent statutory stat testing active 24x7.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Facility Location & Geographic Coordinates */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0077b6] flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Location & Diagnostic Center Address
              </h3>
              <p className="text-xs text-slate-500">Serviceable geographic area and physical collection center address.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                placeholder="e.g. Shivajinagar"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 411016"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-slate-700">
                Full Physical Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. ICC Trade Tower, Senapati Bapat Road, Shivajinagar, Pune"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>
          </div>
        </div>

        {/* 3. Official Contact & Digital Channels */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Official Contact & Digital Channels
              </h3>
              <p className="text-xs text-slate-500">Phlebotomy desk phone, WhatsApp hotline, official portal, and Google Maps pin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Official Website URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://apollodiagnostics.in"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Google Maps Directions URL</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=Apollo+Diagnostics+ICC+Trade+Tower+Pune"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Clinical Overview Narrative */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Clinical Overview Narrative
              </h3>
              <p className="text-xs text-slate-500">Comprehensive summary of diagnostic technology, laboratory scope, and phlebotomy.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Apollo Diagnostics Central Reference Laboratory is a regional pathology reference center featuring automated robotic clinical chemistry, molecular diagnostics, real-time PCR, histopathology, and comprehensive home sample collection throughout Pune."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Markdown supported</span>
              <span>{overview.length} characters</span>
            </div>
          </div>
        </div>

        {/* 5. Test Categories & Services */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                  Test Categories & Clinical Services ({services.length})
                </h3>
                <p className="text-xs text-slate-500">Diagnostic test menus, clinical panels, and phlebotomy packages.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                placeholder="Type test category and press Enter or Add (e.g. Real-Time PCR & Molecular Viral Diagnostics)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
              <button
                type="button"
                onClick={() => handleAddService()}
                className="px-3.5 py-2 rounded-xl bg-[#0077b6] text-white hover:bg-[#005f92] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Common Test Categories:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SERVICES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddService(preset)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-200/60 cursor-pointer transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {services.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/80 text-xs font-semibold"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(item)}
                    className="p-0.5 rounded-full hover:bg-purple-200 text-purple-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Diagnostic Departments */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                6
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                  Diagnostic Departments & Pathology Disciplines ({departments.length})
                </h3>
                <p className="text-xs text-slate-500">Specialized laboratory divisions operating calibrated automated analyzers.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDept())}
                placeholder="Type department and press Enter (e.g. Molecular Genetics & Genomics)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
              <button
                type="button"
                onClick={() => handleAddDept()}
                className="px-3.5 py-2 rounded-xl bg-[#0077b6] text-white hover:bg-[#005f92] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Common Pathology Disciplines:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_DEPARTMENTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddDept(preset)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/60 cursor-pointer transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {departments.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200/80 text-xs font-semibold"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDept(item)}
                    className="p-0.5 rounded-full hover:bg-indigo-200 text-indigo-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 7. Laboratory Facilities & Diagnostic Technology */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xs">
                7
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                  Laboratory Facilities & Technology Infrastructure ({facilities.length})
                </h3>
                <p className="text-xs text-slate-500">Quality systems, robotic analyzers, cold chain storage, and patient lounges.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFacility())}
                placeholder="Type facility/equipment and press Enter (e.g. Automated Roche Cobas Integrated Track Analyzers)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
              />
              <button
                type="button"
                onClick={() => handleAddFacility()}
                className="px-3.5 py-2 rounded-xl bg-[#0077b6] text-white hover:bg-[#005f92] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Common Diagnostic Facilities:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_FACILITIES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddFacility(preset)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200/60 cursor-pointer transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {facilities.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-900 border border-cyan-200/80 text-xs font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(item)}
                    className="p-0.5 rounded-full hover:bg-cyan-200 text-cyan-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Entity Relations: Connected Hospitals & Connected Doctors */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
              8
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                Connected Hospitals & Doctor Relations
              </h3>
              <p className="text-xs text-slate-500">
                Establish database affiliations so this laboratory links to hospitals and consulting specialists on the frontend.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connected Hospitals Multi-Select Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#0077b6]" />
                  <span>Connected Hospitals ({selectedHospitalIds.length} selected)</span>
                </label>
                {selectedHospitalIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedHospitalIds([])}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Selected Hospital Chips */}
              {selectedHospitalIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 max-h-36 overflow-y-auto">
                  {selectedHospitalIds.map((id) => {
                    const hosp = allHospitals.find((h) => h.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-xs font-bold text-[#03045e] shadow-2xs"
                      >
                        <Building2 className="w-3 h-3 text-[#0077b6]" />
                        <span className="truncate max-w-[180px]">{hosp?.name || id}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleHospital(id)}
                          className="hover:text-red-600 p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Hospital Search & Selector */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder="Search hospitals by name, area or city..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                />

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/40">
                  {isLoadingHospitals ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading hospitals...</div>
                  ) : filteredHospitals.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No matching hospitals found</div>
                  ) : (
                    filteredHospitals.map((hosp) => {
                      const isSelected = selectedHospitalIds.includes(hosp.id);
                      return (
                        <div
                          key={hosp.id}
                          onClick={() => handleToggleHospital(hosp.id)}
                          className={`p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-100/70 font-semibold' : 'hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[#03045e] truncate">{hosp.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {hosp.area ? `${hosp.area}, ` : ''}{hosp.city}
                              {hosp.facilityType ? ` • ${hosp.facilityType}` : ''}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-[#0077b6] border-[#0077b6] text-white'
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

            {/* Connected Doctors Multi-Select Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>Connected Consulting Doctors ({selectedDoctorIds.length} selected)</span>
                </label>
                {selectedDoctorIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorIds([])}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Selected Doctor Chips */}
              {selectedDoctorIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 max-h-36 overflow-y-auto">
                  {selectedDoctorIds.map((id) => {
                    const doc = allDoctors.find((d) => d.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs font-bold text-emerald-950 shadow-2xs"
                      >
                        <Stethoscope className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-[180px]">{doc?.name || id}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleDoctor(id)}
                          className="hover:text-red-600 p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Doctor Search & Speciality Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctors by name or speciality..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <select
                    value={doctorSpecialityFilter}
                    onChange={(e) => setDoctorSpecialityFilter(e.target.value)}
                    className="px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">All Specialities</option>
                    {availableSpecialities.slice(0, 15).map((spec, i) => (
                      <option key={i} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-slate-50/40">
                  {isLoadingDoctors ? (
                    <div className="p-4 text-center text-xs text-slate-400">Loading doctors...</div>
                  ) : filteredDoctors.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No matching doctors found</div>
                  ) : (
                    filteredDoctors.map((doc) => {
                      const isSelected = selectedDoctorIds.includes(doc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleToggleDoctor(doc.id)}
                          className={`p-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-100/70 font-semibold' : 'hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-emerald-950 truncate">{doc.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {doc.speciality} {doc.qualifications ? `• ${doc.qualifications}` : ''}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white'
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
          </div>
        </div>

        {/* 9. Facility Photos & Cloudflare R2 Media Gallery (Up to 50 Images Max) */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-xs">
                9
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#03045e]">
                  Facility Photos & Cloudflare R2 Media Gallery ({images.length} of 50 uploaded)
                </h3>
                <p className="text-xs text-slate-500">
                  Multiple image batch uploader. Generates 1200px full WebP and 600px card WebP variants.
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
                htmlFor="multi-lab-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Select Laboratory Photos (Up to 50 max)</span>
              </label>
              <input
                id="multi-lab-file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={isUploadingImages}
                onChange={handleMultipleImageFiles}
                className="hidden"
              />
              <p className="text-[11px] text-slate-500">
                Supports JPG, PNG, WEBP. Maximum 50 images per laboratory.
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
                        <span>Cover</span>
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
                      title="Set as Primary Cover Photo"
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
              No photos uploaded yet. Select images above to populate the facility photo gallery.
            </div>
          )}
        </div>

        {/* Submit Action Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Clicking publish inserts into Neon PostgreSQL <code className="text-slate-700 font-bold">laboratories</code> table and establishes relational affiliations.
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
                  <span>Publishing to Database...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Laboratory to Directory</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
