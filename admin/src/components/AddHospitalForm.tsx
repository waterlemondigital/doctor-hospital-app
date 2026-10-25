import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Bed,
  ShieldCheck,
  CheckCircle2,
  Plus,
  X,
  Upload,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Stethoscope,
  FlaskConical,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileText,
  Star,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetDoctor, TargetLaboratory } from '../types';
import { createHospital, uploadEntityImage, uploadMultipleEntityImages } from '../api/client';

interface AddHospitalFormProps {
  doctors: TargetDoctor[];
  laboratories: TargetLaboratory[];
  onHospitalCreated?: () => void;
}

interface ImageItem {
  url: string;
  card_url?: string;
  alt: string;
  caption?: string;
  is_primary?: boolean;
}

const FACILITY_TYPES = [
  'Super-Speciality Tertiary Care',
  'Government Teaching Hospital',
  'Multispeciality Hospital',
  'Quaternary Care Flagship Hospital',
  'Speciality Surgical Institute',
  'Comprehensive Cancer Centre',
  'Cardiac Care Institute',
  'Children & Paediatric Hospital',
];

const PRESET_SERVICES = [
  'Comprehensive Cardiac Care & Cath Lab',
  'Advanced Neurosciences & Comprehensive Stroke Unit',
  'Multi-Organ Transplant Center (Liver, Kidney, Pancreas)',
  '24x7 Level-1 Emergency & Polytrauma Care',
  'Minimally Invasive & Robotic Joint Replacement',
  'Advanced Medical & Surgical Oncology',
  'High-Risk Neonatal and Paediatric Critical Care',
  'Comprehensive Nephrology & Dialysis Unit',
  'Inpatient Surgical Pathways & Post-Op Recovery',
  'Preventive Health Checks & Outpatient Clinics',
];

const PRESET_DEPARTMENTS = [
  'Cardiology & Cardiovascular Thoracic Surgery',
  'Neurology & Neurosurgery',
  'Orthopaedics & Spine Surgery',
  'Medical & Surgical Oncology',
  'Nephrology & Urology',
  'Gastroenterology & Hepatology',
  'General Medicine & Critical Care',
  'Obstetrics & Gynaecology',
  'Paediatrics & Neonatology',
  'Pulmonology & Respiratory Medicine',
  'Emergency Medicine & Trauma',
  'Plastic & Reconstructive Surgery',
];

const PRESET_FACILITIES = [
  '24x7 Emergency & Advanced Life Support Ambulances',
  '40-Bed Modern Intensive Care Unit with ECMO Support',
  '12 Ultra-Clean Modular Operation Theatres',
  'In-house 3 Tesla Digital MRI and 128-Slice CT Scan',
  'NABL-Accredited 24-Hour Clinical Pathology Lab',
  'Central In-house Pharmacy 24x7',
  'Regional Blood Bank with Apheresis Support',
  'Executive Health Checkup Suites',
  'Dedicated Isolation Wards & Negative Pressure Rooms',
  'Valet Parking & Multi-Level Facility Access',
];

export function AddHospitalForm({
  doctors,
  laboratories,
  onHospitalCreated,
}: AddHospitalFormProps) {
  // Form State
  const [name, setName] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('Pune');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [facilityType, setFacilityType] = useState('Super-Speciality Tertiary Care');
  const [facilityTypeBadge, setFacilityTypeBadge] = useState('NABH & NABL Accredited Flagship');
  const [bedCount, setBedCount] = useState<string>('202');
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [phone, setPhone] = useState('+91 20 6721 5000');
  const [whatsapp, setWhatsapp] = useState('+91 20 6721 5000');
  const [website, setWebsite] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [overview, setOverview] = useState('');

  // Lists State
  const [services, setServices] = useState<string[]>([
    'Comprehensive Cardiac Care & Cath Lab',
    'Advanced Neurosciences & Comprehensive Stroke Unit',
    'Multi-Organ Transplant Center (Liver, Kidney, Pancreas)',
    '24x7 Level-1 Emergency & Polytrauma Care',
    'Minimally Invasive & Robotic Joint Replacement',
  ]);
  const [serviceInput, setServiceInput] = useState('');

  const [departments, setDepartments] = useState<string[]>([
    'Cardiology & Cardiovascular Thoracic Surgery',
    'Neurology & Neurosurgery',
    'Orthopaedics & Spine Surgery',
    'Medical & Surgical Oncology',
    'Nephrology & Urology',
  ]);
  const [deptInput, setDeptInput] = useState('');

  const [facilities, setFacilities] = useState<string[]>([
    '24x7 Emergency & Advanced Life Support Ambulances',
    '40-Bed Modern Intensive Care Unit with ECMO Support',
    '12 Ultra-Clean Modular Operation Theatres',
    'In-house 3 Tesla Digital MRI and 128-Slice CT Scan',
    'NABL-Accredited 24-Hour Clinical Pathology Lab',
  ]);
  const [facilityInput, setFacilityInput] = useState('');

  // Affiliations
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
      fetch('/api/v1/doctors')
        .then((res) => res.json())
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAllDoctors(
              data.map((d) => ({
                id: d.id,
                slug: d.slug,
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
                clinicAddress: d.area || '',
                medicalRegNo: '',
                primaryHospital: d.hospitals?.[0]?.hospital_name || 'Affiliated Hospital',
                hasPortalAccount: false,
                portalAccountStatus: 'not_registered',
                dashboardAccessEnabled: false,
                portalEmail: '',
                leadCount: 0,
              }))
            );
          }
        })
        .catch((err) => console.warn('Could not fetch DB doctors fallback:', err))
        .finally(() => setIsLoadingDoctors(false));
    }
  }, [doctors]);

  const [allLaboratories, setAllLaboratories] = useState<TargetLaboratory[]>(laboratories || []);
  const [selectedLabIds, setSelectedLabIds] = useState<string[]>([]);
  const [labSearch, setLabSearch] = useState('');
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);

  useEffect(() => {
    if (laboratories && laboratories.length > 0) {
      setAllLaboratories(laboratories);
    } else {
      setIsLoadingLabs(true);
      fetch('/api/v1/laboratories')
        .then((res) => res.json())
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
                portalAccountStatus: 'not_registered',
                dashboardAccessEnabled: false,
                portalEmail: '',
                leadCount: 0,
              }))
            );
          }
        })
        .catch((err) => console.warn('Could not fetch DB laboratories fallback:', err))
        .finally(() => setIsLoadingLabs(false));
    }
  }, [laboratories]);

  // Images
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImageAlt, setCustomImageAlt] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdHospital, setCreatedHospital] = useState<{
    hospital: any;
    frontendUrl: string;
  } | null>(null);

  // Template Quick Loader: Sahyadri Super Speciality Hospital (from hospitals.template.md)
  const loadSahyadriTemplate = () => {
    setName('Sahyadri Super Speciality Hospital');
    setCity('Pune');
    setArea('Deccan Gymkhana');
    setState('Maharashtra');
    setAddress('Plot No. 30-C, Erandwane, Karve Road, Deccan Gymkhana, Pune');
    setPincode('411004');
    setFacilityType('Super-Speciality Tertiary Care');
    setFacilityTypeBadge('NABH & NABL Accredited Flagship');
    setBedCount('202');
    setEmergencyAvailable(true);
    setPhone('+91 20 6721 5000');
    setWhatsapp('+91 98220 12345');
    setWebsite('https://sahyadrihospital.com');
    setMapsUrl('https://maps.google.com/?q=Sahyadri+Hospital+Deccan+Gymkhana+Pune');
    setOverview(
      'Sahyadri Super Speciality Hospital, Deccan Gymkhana is the flagship quaternary-care hospital of Western India. It houses dedicated centers of excellence for cardiology, neurosciences, organ transplants, orthopaedics, and critical care.'
    );
    setServices([
      'Comprehensive Cardiac Care & Cath Lab',
      'Advanced Neurosciences & Comprehensive Stroke Unit',
      'Multi-Organ Transplant Center (Liver, Kidney, Pancreas)',
      '24x7 Level-1 Emergency & Polytrauma Care',
      'Minimally Invasive & Robotic Joint Replacement',
    ]);
    setDepartments([
      'Cardiology & Cardiovascular Thoracic Surgery',
      'Neurology & Neurosurgery',
      'Orthopaedics & Spine Surgery',
      'Medical & Surgical Oncology',
      'Nephrology & Urology',
    ]);
    setFacilities([
      '24x7 Emergency & Advanced Life Support Ambulances',
      '40-Bed Modern Intensive Care Unit with ECMO Support',
      '12 Ultra-Clean Modular Operation Theatres',
      'In-house 3 Tesla Digital MRI and 128-Slice CT Scan',
      'NABL-Accredited 24-Hour Clinical Pathology Lab',
    ]);
    setCreatedHospital(null);
    toast.success('Loaded Sahyadri Hospital template data!');
  };

  // Template Quick Loader: Sassoon General Hospital (from hospitals.template.md)
  const loadSassoonTemplate = () => {
    setName('Sassoon General Hospital & B.J. Government Medical College');
    setCity('Pune');
    setArea('Pune Station');
    setState('Maharashtra');
    setAddress('Jai Prakash Narayan Road, Near Pune Railway Station, Pune');
    setPincode('411001');
    setFacilityType('Government Teaching Hospital');
    setFacilityTypeBadge('Landmark Public Tertiary Teaching Hospital');
    setBedCount('1296');
    setEmergencyAvailable(true);
    setPhone('+91 20 2612 8000');
    setWhatsapp('+91 20 2612 8000');
    setWebsite('https://bjmcpune.org');
    setMapsUrl('https://maps.google.com/?q=Sassoon+General+Hospital+Pune');
    setOverview(
      'Sassoon General Hospital is a historic 1,296-bed public tertiary teaching hospital affiliated with B.J. Government Medical College. Founded in 1867, it provides comprehensive subsidised and free clinical healthcare across all medical and surgical sub-specialities.'
    );
    setServices([
      'Subsidised & Free OPD / IPD Consultations',
      '24x7 Multi-Discipline Trauma and Disaster Response',
      'High-Risk Neonatal and Paediatric Critical Care',
      'Government Ayushman Bharat & MJPJAY Scheme Treatments',
    ]);
    setDepartments([
      'General Medicine & Critical Care',
      'General Surgery & Surgical Specialties',
      'Paediatrics & Neonatology',
      'Obstetrics & Gynaecology',
    ]);
    setFacilities([
      '1296-Bed Inpatient Capacity',
      '24-Hour Emergency Medical Unit',
      'Central Clinical Biochemistry & Microbiology Lab',
      'Regional Blood Bank with Apheresis',
    ]);
    setCreatedHospital(null);
    toast.success('Loaded Sassoon Hospital template data!');
  };

  const resetForm = () => {
    setName('');
    setState('Maharashtra');
    setCity('Pune');
    setArea('');
    setAddress('');
    setPincode('');
    setFacilityType('Super-Speciality Tertiary Care');
    setFacilityTypeBadge('Accredited Tertiary Hospital');
    setBedCount('100');
    setEmergencyAvailable(true);
    setPhone('+91 20 6721 5000');
    setWhatsapp('+91 20 6721 5000');
    setWebsite('');
    setMapsUrl('');
    setOverview('');
    setServices([]);
    setDepartments([]);
    setFacilities([]);
    setSelectedDoctorIds([]);
    setSelectedLabIds([]);
    setImages([]);
    setCreatedHospital(null);
    toast.info('Hospital form reset.');
  };

  // Add Item Helpers
  const addService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput('');
    }
  };

  const removeService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  const addDepartment = () => {
    if (deptInput.trim() && !departments.includes(deptInput.trim())) {
      setDepartments([...departments, deptInput.trim()]);
      setDeptInput('');
    }
  };

  const removeDepartment = (idx: number) => {
    setDepartments(departments.filter((_, i) => i !== idx));
  };

  const addFacility = () => {
    if (facilityInput.trim() && !facilities.includes(facilityInput.trim())) {
      setFacilities([...facilities, facilityInput.trim()]);
      setFacilityInput('');
    }
  };

  const removeFacility = (idx: number) => {
    setFacilities(facilities.filter((_, i) => i !== idx));
  };

  // Multiple Images Upload Handler (Supports up to 50 images total)
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);
    const currentCount = images.length;
    const remainingSlots = 50 - currentCount;

    if (remainingSlots <= 0) {
      toast.error('Maximum limit reached: You have already attached 50 images.');
      e.target.value = '';
      return;
    }

    let filesToUpload = filesArray;
    if (filesArray.length > remainingSlots) {
      toast.warning(
        `Only ${remainingSlots} more image(s) can be added to reach the 50 images limit. Uploading the first ${remainingSlots}.`
      );
      filesToUpload = filesArray.slice(0, remainingSlots);
    }

    setIsUploadingImage(true);
    const toastId = toast.loading(
      `Uploading & optimizing ${filesToUpload.length} image(s) to Cloudflare R2...`
    );

    try {
      const tempId = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'hospital';
      const result = await uploadMultipleEntityImages(filesToUpload, 'hospitals', tempId);

      const formattedImages: ImageItem[] = result.images.map((item, idx) => ({
        url: item.url,
        card_url: item.card_url,
        alt: `${name || 'Hospital'} View ${currentCount + idx + 1}`,
        caption: `${name || 'Hospital'} Facility View ${currentCount + idx + 1}`,
        is_primary: currentCount === 0 && idx === 0,
      }));

      setImages((prev) => [...prev, ...formattedImages]);
      toast.success(`Successfully uploaded ${result.count} images to Cloudflare R2!`, { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload images: ' + err.message, { id: toastId });
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
    toast.success(`Photo #${index + 1} set as primary cover.`);
  };

  const addCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    if (images.length >= 50) {
      toast.error('Maximum limit reached: 50 images attached.');
      return;
    }
    setImages((prev) => [
      ...prev,
      {
        url: customImageUrl.trim(),
        card_url: customImageUrl.trim(),
        alt: customImageAlt.trim() || `${name || 'Hospital'} View ${images.length + 1}`,
        caption: customImageAlt.trim() || `${name || 'Hospital'} View`,
        is_primary: prev.length === 0,
      },
    ]);
    setCustomImageUrl('');
    setCustomImageAlt('');
    toast.success('Custom image URL added.');
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      // If we removed the primary image, make the first one primary
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const clearAllImages = () => {
    setImages([]);
    toast.info('All gallery photos cleared.');
  };

  // Submit Form Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Hospital Name is required.');
      return;
    }
    if (!city.trim()) {
      toast.error('City is required.');
      return;
    }
    if (!state.trim()) {
      toast.error('State is required.');
      return;
    }
    if (!address.trim()) {
      toast.error('Street Address is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createHospital({
        name: name.trim(),
        city: city.trim(),
        area: area.trim() || city.trim(),
        state: state.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        facility_type: facilityType,
        facility_type_badge: facilityTypeBadge.trim() || facilityType,
        bed_count: bedCount ? parseInt(bedCount, 10) : undefined,
        emergency_available_24x7: emergencyAvailable,
        phone: phone ? phone.trim() : '',
        whatsapp: whatsapp ? whatsapp.trim() : '',
        website: website.trim(),
        maps_url: mapsUrl.trim(),
        overview: overview.trim(),
        services,
        departments: departments.map((d) => ({
          name: d,
          slug: d.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        })),
        facilities,
        images,
        connected_doctor_ids: selectedDoctorIds,
        connected_laboratory_ids: selectedLabIds,
      });

      setCreatedHospital({
        hospital: res.hospital,
        frontendUrl: res.frontendUrl,
      });

      toast.success(res.message || 'Hospital successfully created and published!');
      if (onHospitalCreated) {
        onHospitalCreated();
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to create hospital: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Doctors and Labs for affiliation selection
  const filteredDoctors = allDoctors.filter((d) => {
    const q = doctorSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.speciality && d.speciality.toLowerCase().includes(q)) ||
      (d.department && d.department.toLowerCase().includes(q)) ||
      (d.city && d.city.toLowerCase().includes(q)) ||
      (d.title && d.title.toLowerCase().includes(q));

    const matchSpec =
      doctorSpecialityFilter === 'all' ||
      (d.speciality && d.speciality.toLowerCase().includes(doctorSpecialityFilter.toLowerCase())) ||
      (d.department && d.department.toLowerCase().includes(doctorSpecialityFilter.toLowerCase()));

    return matchSearch && matchSpec;
  });

  const filteredLabs = allLaboratories.filter((l) => {
    const q = labSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      (l.area && l.area.toLowerCase().includes(q)) ||
      (l.facilityType && l.facilityType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Template Loaders */}
      <div className="bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Building2 className="w-64 h-64" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-[#caf0f8] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Directory Management
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Add Hospital to Directory
              </h2>
              <p className="text-sm text-[#caf0f8] mt-1 max-w-2xl">
                Insert a complete verified hospital profile. Fields adhere to{' '}
                <code className="bg-white/20 px-1.5 py-0.5 rounded text-xs text-white">
                  hospitals.template.md
                </code>{' '}
                and instantly sync to Neon PostgreSQL and frontend directory pages.
              </p>
            </div>

            {/* Quick Template Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadSahyadriTemplate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all text-white cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>Load Sahyadri Template</span>
              </button>
              <button
                type="button"
                onClick={loadSassoonTemplate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all text-white cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-300" />
                <span>Load Sassoon Template</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold transition-all text-white cursor-pointer"
                title="Clear all fields"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner when created */}
      {createdHospital && (
        <div className="bg-emerald-50 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-950">
                  Hospital Published Successfully!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Record written to PostgreSQL table <code className="font-mono">hospitals</code>{' '}
                  and in-memory directory cache reloaded.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`http://localhost:3000${createdHospital.frontendUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span>View on Frontend</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setCreatedHospital(null)}
                className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Multi-Card Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identity & Physical Coordinates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-[#caf0f8] text-[#0077b6]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#03045e]">
                1. Hospital Identity & Location
              </h3>
              <p className="text-xs text-slate-500">
                Official entity name and registered physical street address
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hospital Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sahyadri Super Speciality Hospital"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area / Sub-locality <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Deccan Gymkhana"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 411004"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Complete Registered Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot No. 30-C, Erandwane, Karve Road, Deccan Gymkhana, Pune"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Classification, Badges & Bed Infrastructure */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#03045e]">
                2. Facility Classification & Capacity
              </h3>
              <p className="text-xs text-slate-500">
                Accreditations, bed capacity and emergency operational status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Facility Type <span className="text-red-500">*</span>
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium bg-white"
              >
                {FACILITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Badge / Accreditation Highlight
              </label>
              <input
                type="text"
                value={facilityTypeBadge}
                onChange={(e) => setFacilityTypeBadge(e.target.value)}
                placeholder="e.g. NABH & NABL Accredited Flagship"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bed Count
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={bedCount}
                  onChange={(e) => setBedCount(e.target.value)}
                  placeholder="e.g. 202"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
                />
                <Bed className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={emergencyAvailable}
                  onChange={(e) => setEmergencyAvailable(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-[#0077b6] focus:ring-[#0077b6] border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  24x7 Emergency Services
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Digital Coordinates & Web Presence */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#03045e]">
                3. Digital Coordinates & Web Presence
              </h3>
              <p className="text-xs text-slate-500">
                Official website portal and Google Maps navigation anchor (Phone & WhatsApp inquiries are managed statically on frontend)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Website URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://hospital.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
                />
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Google Maps Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Clinical Narrative & Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#03045e]">
                4. Clinical Overview Narrative
              </h3>
              <p className="text-xs text-slate-500">
                Detailed description presented on the hospital page
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="e.g. Sahyadri Super Speciality Hospital, Deccan Gymkhana is the flagship quaternary-care hospital of Western India..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef]/40 text-sm outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Card 5: Services, Departments & Facilities Tag Lists */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#03045e]">
                5. Clinical Scope: Services, Departments & Facilities
              </h3>
              <p className="text-xs text-slate-500">
                Add bullet items and click presets to quickly populate
              </p>
            </div>
          </div>

          {/* Services Tag Manager */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">
              Clinical Services & Scope ({services.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addService();
                  }
                }}
                placeholder="Type service and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#0077b6] outline-hidden"
              />
              <button
                type="button"
                onClick={addService}
                className="px-3 py-2 rounded-xl bg-[#0077b6] text-white text-xs font-bold hover:bg-[#005f92] transition-colors"
              >
                Add Service
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center">Presets:</span>
              {PRESET_SERVICES.filter((ps) => !services.includes(ps)).slice(0, 4).map((ps) => (
                <button
                  key={ps}
                  type="button"
                  onClick={() => setServices([...services, ps])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#caf0f8] text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#0077b6]" />
                  <span>{ps}</span>
                </button>
              ))}
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2 pt-1">
              {services.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => removeService(idx)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Departments Tag Manager */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              Medical & Surgical Departments ({departments.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={deptInput}
                onChange={(e) => setDeptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDepartment();
                  }
                }}
                placeholder="Type department and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#0077b6] outline-hidden"
              />
              <button
                type="button"
                onClick={addDepartment}
                className="px-3 py-2 rounded-xl bg-[#0077b6] text-white text-xs font-bold hover:bg-[#005f92] transition-colors"
              >
                Add Department
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center">Presets:</span>
              {PRESET_DEPARTMENTS.filter((pd) => !departments.includes(pd)).slice(0, 5).map((pd) => (
                <button
                  key={pd}
                  type="button"
                  onClick={() => setDepartments([...departments, pd])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#caf0f8] text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#0077b6]" />
                  <span>{pd}</span>
                </button>
              ))}
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2 pt-1">
              {departments.map((d, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold"
                >
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => removeDepartment(idx)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Facilities Tag Manager */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              Infrastructure & Clinical Facilities ({facilities.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFacility();
                  }
                }}
                placeholder="Type facility and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-[#0077b6] outline-hidden"
              />
              <button
                type="button"
                onClick={addFacility}
                className="px-3 py-2 rounded-xl bg-[#0077b6] text-white text-xs font-bold hover:bg-[#005f92] transition-colors"
              >
                Add Facility
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center">Presets:</span>
              {PRESET_FACILITIES.filter((pf) => !facilities.includes(pf)).slice(0, 4).map((pf) => (
                <button
                  key={pf}
                  type="button"
                  onClick={() => setFacilities([...facilities, pf])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#caf0f8] text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#0077b6]" />
                  <span>{pf}</span>
                </button>
              ))}
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2 pt-1">
              {facilities.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold"
                >
                  <span>{f}</span>
                  <button
                    type="button"
                    onClick={() => removeFacility(idx)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 6: Relations & Affiliations (Doctors & Labs) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#03045e]">
                6. Hospital Relations & Entity Connections
              </h3>
              <p className="text-xs text-slate-500">
                Link existing consultants and diagnostic reference laboratories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Connected Doctors Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0077b6]" />
                  <span>
                    Connected Doctors{' '}
                    <span className="text-[#0077b6] font-extrabold">({selectedDoctorIds.length} connected)</span>
                    <span className="text-slate-400 font-normal ml-1">
                      • {allDoctors.length} available in DB
                    </span>
                  </span>
                </label>
                {selectedDoctorIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorIds([])}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Clear All ({selectedDoctorIds.length})
                  </button>
                )}
              </div>

              {/* Selected Doctors Chips Bar */}
              {selectedDoctorIds.length > 0 && (
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-[#03045e] flex items-center justify-between">
                    <span>Currently Linked Doctors:</span>
                    <span className="text-[10px] text-slate-500 font-medium">Click × to detach</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedDoctorIds.map((id) => {
                      const doc = allDoctors.find((d) => d.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#90e0ef] text-[11px] font-bold text-[#03045e] shadow-2xs"
                        >
                          <span className="truncate max-w-[140px]">{doc ? doc.name : id}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedDoctorIds(selectedDoctorIds.filter((item) => item !== id))}
                            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Speciality Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-400 mr-1">Filter:</span>
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Cardiology', value: 'Cardiology' },
                  { label: 'Oncology', value: 'Oncology' },
                  { label: 'Orthopaedics', value: 'Orthopaedics' },
                  { label: 'Neurology', value: 'Neurology' },
                  { label: 'Paediatrics', value: 'Paediatrics' },
                  { label: 'Medicine', value: 'Medicine' },
                ].map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setDoctorSpecialityFilter(chip.value)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                      doctorSpecialityFilter.toLowerCase() === chip.value.toLowerCase()
                        ? 'bg-[#0077b6] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Search Box & Quick Actions */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search by doctor name, speciality, department, city..."
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-hidden focus:border-[#0077b6] bg-white"
                  />
                  {doctorSearch && (
                    <button
                      type="button"
                      onClick={() => setDoctorSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>
                    Showing <strong className="text-slate-700">{filteredDoctors.length}</strong> of{' '}
                    <strong>{allDoctors.length}</strong> doctors
                  </span>
                  {filteredDoctors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newIds = Array.from(
                          new Set([...selectedDoctorIds, ...filteredDoctors.map((d) => d.id)])
                        );
                        setSelectedDoctorIds(newIds);
                      }}
                      className="text-[#0077b6] hover:underline font-bold cursor-pointer"
                    >
                      + Select All Filtered ({filteredDoctors.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Doctor Selection List */}
              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/50 divide-y divide-slate-100">
                {isLoadingDoctors ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0077b6]" />
                    <span>Loading doctors from database...</span>
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No doctors found matching "{doctorSearch}".
                  </p>
                ) : (
                  filteredDoctors.map((doc) => {
                    const isSelected = selectedDoctorIds.includes(doc.id);
                    return (
                      <label
                        key={doc.id}
                        className={`flex items-start justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border border-[#90e0ef] text-[#03045e] shadow-2xs'
                            : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDoctorIds([...selectedDoctorIds, doc.id]);
                              } else {
                                setSelectedDoctorIds(
                                  selectedDoctorIds.filter((id) => id !== doc.id)
                                );
                              }
                            }}
                            className="mt-1 rounded text-[#0077b6] focus:ring-[#0077b6] cursor-pointer"
                          />
                          
                          {/* Doctor Avatar / Initials */}
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0077b6] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden mt-0.5">
                            {doc.photo ? (
                              <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{doc.name.replace(/^Dr\.\s*/i, '').charAt(0) || 'D'}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                              <span>{doc.name}</span>
                              {doc.speciality && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#caf0f8] text-[#03045e]">
                                  {doc.speciality}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                              {doc.title || doc.qualifications || doc.department || 'Consultant Specialist'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 capitalize block">
                            {doc.city || 'Pune'}
                          </span>
                          {doc.experienceYears && (
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {doc.experienceYears} exp
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Connected Laboratories Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                  <span>
                    Connected Laboratories{' '}
                    <span className="text-purple-600 font-extrabold">({selectedLabIds.length} connected)</span>
                    <span className="text-slate-400 font-normal ml-1">
                      • {allLaboratories.length} available in DB
                    </span>
                  </span>
                </label>
                {selectedLabIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedLabIds([])}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Clear All ({selectedLabIds.length})
                  </button>
                )}
              </div>

              {/* Selected Laboratories Chips Bar */}
              {selectedLabIds.length > 0 && (
                <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-purple-900 flex items-center justify-between">
                    <span>Currently Linked Laboratories:</span>
                    <span className="text-[10px] text-slate-500 font-medium">Click × to detach</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedLabIds.map((id) => {
                      const lab = allLaboratories.find((l) => l.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-900 shadow-2xs"
                        >
                          <span className="truncate max-w-[160px]">{lab ? lab.name : id}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedLabIds(selectedLabIds.filter((item) => item !== id))}
                            className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search Box & Quick Actions */}
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    value={labSearch}
                    onChange={(e) => setLabSearch(e.target.value)}
                    placeholder="Search diagnostic labs by name, accreditation, or city..."
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-hidden focus:border-purple-500 bg-white"
                  />
                  {labSearch && (
                    <button
                      type="button"
                      onClick={() => setLabSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>
                    Showing <strong className="text-slate-700">{filteredLabs.length}</strong> of{' '}
                    <strong>{allLaboratories.length}</strong> laboratories
                  </span>
                  {filteredLabs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newIds = Array.from(
                          new Set([...selectedLabIds, ...filteredLabs.map((l) => l.id)])
                        );
                        setSelectedLabIds(newIds);
                      }}
                      className="text-purple-600 hover:underline font-bold cursor-pointer"
                    >
                      + Select All Filtered ({filteredLabs.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Laboratory Selection List */}
              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/50 divide-y divide-slate-100">
                {isLoadingLabs ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Loading laboratories from database...</span>
                  </div>
                ) : filteredLabs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No laboratories found matching "{labSearch}".
                  </p>
                ) : (
                  filteredLabs.map((lab) => {
                    const isSelected = selectedLabIds.includes(lab.id);
                    return (
                      <label
                        key={lab.id}
                        className={`flex items-start justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-50/80 border border-purple-200 text-purple-950 shadow-2xs'
                            : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLabIds([...selectedLabIds, lab.id]);
                              } else {
                                setSelectedLabIds(
                                  selectedLabIds.filter((id) => id !== lab.id)
                                );
                              }
                            }}
                            className="mt-1 rounded text-purple-600 focus:ring-purple-600 cursor-pointer"
                          />

                          {/* Lab Icon / Thumbnail */}
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden mt-0.5">
                            {lab.coverImage ? (
                              <img src={lab.coverImage} alt={lab.name} className="w-full h-full object-cover" />
                            ) : (
                              <FlaskConical className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                              <span>{lab.name}</span>
                              {lab.facilityType && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800">
                                  {lab.facilityType}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                              {lab.area || lab.address || 'Diagnostic Testing Facility'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 capitalize block">
                            {lab.city || 'Pune'}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 7: Images & Cloudflare R2 Uploads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-pink-50 text-pink-700">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#03045e] flex items-center gap-2">
                  <span>7. Facility Photos & Cloudflare R2 Media Gallery</span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                    {images.length} / 50 Photos
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Batch upload up to 50 photos simultaneously to Cloudflare R2 with automatic WebP conversion and responsive card thumbnails.
                </p>
              </div>
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllImages}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Clear All Photos
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct Multi-File Upload to R2 */}
            <div className="border-2 border-dashed border-slate-300 hover:border-[#0077b6] rounded-2xl p-6 text-center transition-colors bg-slate-50/60 flex flex-col items-center justify-center">
              <input
                type="file"
                id="hospital-image-file"
                multiple
                accept="image/*"
                onChange={handleMultipleImageUpload}
                disabled={isUploadingImage || images.length >= 50}
                className="hidden"
              />
              <label
                htmlFor="hospital-image-file"
                className={`w-full flex flex-col items-center justify-center gap-2.5 ${
                  images.length >= 50 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                {isUploadingImage ? (
                  <div className="p-3 rounded-full bg-blue-100 text-[#0077b6]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div className="p-3 rounded-full bg-blue-100/70 text-[#0077b6] hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#0077b6] block">
                    {isUploadingImage
                      ? 'Uploading & Processing Images on R2...'
                      : images.length >= 50
                      ? 'Maximum 50 Images Limit Reached'
                      : 'Click to Select Multiple Images (Up to 50 max)'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Select multiple PNG, JPG, or WebP files at once. Auto-generates full 1200px & 600px card variants.
                  </p>
                </div>
              </label>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2.5 flex flex-col justify-center bg-slate-50/40 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Or Add Existing Cloudflare R2 / Public Image URL</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Remaining slots: {Math.max(0, 50 - images.length)}
                </span>
              </label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://pub-28498877bcce48c2a9c3df3196f30f57.r2.dev/..."
                disabled={images.length >= 50}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-hidden focus:border-[#0077b6] bg-white"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customImageAlt}
                  onChange={(e) => setCustomImageAlt(e.target.value)}
                  placeholder="Image description / Alt label..."
                  disabled={images.length >= 50}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium outline-hidden focus:border-[#0077b6] bg-white"
                />
                <button
                  type="button"
                  onClick={addCustomImageUrl}
                  disabled={images.length >= 50 || !customImageUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* Current Multi-Image Gallery Preview */}
          {images.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                  <span>
                    Media Gallery <strong className="text-slate-900">({images.length})</strong>
                    <span className="text-slate-400 font-normal ml-1">of 50 maximum photos</span>
                  </span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Tip: Star an image to set it as the primary directory card cover
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`group relative rounded-xl overflow-hidden border bg-slate-100 aspect-video shadow-2xs transition-all ${
                      img.is_primary || (idx === 0 && !images.some((i) => i.is_primary))
                        ? 'border-2 border-emerald-500 ring-2 ring-emerald-200'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={img.card_url || img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white">
                        #{idx + 1}
                      </span>
                      {(img.is_primary || (idx === 0 && !images.some((i) => i.is_primary))) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-[9px] font-bold text-white shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Cover</span>
                        </span>
                      )}
                    </div>

                    {/* Hover Controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold cursor-pointer transition-colors"
                        title="Set as Primary Cover Photo"
                      >
                        <Star className="w-3 h-3 text-amber-500" />
                        <span>Set Cover</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>

                    {/* Caption Preview */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pointer-events-none">
                      <p className="text-[10px] text-white truncate font-medium">
                        {img.caption || img.alt || `Photo ${idx + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to Database & Syncing Cache...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Hospital to Live Directory</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
