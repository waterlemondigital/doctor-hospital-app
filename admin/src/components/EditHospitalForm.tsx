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
  Stethoscope,
  FlaskConical,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileText,
  Trash2,
  ArrowLeft,
  Save,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetDoctor, TargetLaboratory } from '../types';
import {
  fetchHospitalById,
  updateHospital,
  deleteHospital,
  uploadMultipleEntityImages,
  fetchAllPublicDoctors,
  fetchAllPublicLaboratories,
} from '../api/client';

interface EditHospitalFormProps {
  hospitalId: string;
  doctors?: TargetDoctor[];
  laboratories?: TargetLaboratory[];
  onHospitalUpdated: () => void;
  onBack: () => void;
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
  '24x7 Emergency & Trauma Care',
  'Intensive Care Unit (ICU/NICU/PICU)',
  'Comprehensive Diagnostic Imaging',
  'Outpatient Consultation (OPD)',
  'Inpatient Surgical Theatres',
  'Pharmacy Services 24x7',
  'Dialysis Care',
  'Cardiac Catheterization Lab',
  'Physiotherapy & Rehabilitation',
];

const PRESET_DEPARTMENTS = [
  'Cardiology',
  'Orthopaedic Surgery',
  'Neurology & Neurosurgery',
  'Oncology',
  'Gastroenterology',
  'Nephrology',
  'Urology',
  'Pediatrics',
  'General Surgery',
  'Internal Medicine',
  'Pulmonology',
  'Obstetrics & Gynecology',
];

const PRESET_FACILITIES = [
  '24x7 Ambulance Service',
  'In-House Diagnostic Labs',
  'Blood Bank & Transfusion',
  'Cafeteria & Dining',
  'Wheelchair Accessible',
  'Private & Deluxe Patient Suites',
  'Valet & Multi-Level Parking',
  'International Patient Lounge',
  'ATM & Banking Kiosk',
];

export function EditHospitalForm({
  hospitalId,
  doctors = [],
  laboratories = [],
  onHospitalUpdated,
  onBack,
}: EditHospitalFormProps) {
  const [isLoadingHospital, setIsLoadingHospital] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [facilityType, setFacilityType] = useState('Super-Speciality Tertiary Care');
  const [facilityTypeBadge, setFacilityTypeBadge] = useState('Accredited Tertiary Hospital');
  const [bedCount, setBedCount] = useState<string>('');
  const [emergency24x7, setEmergency24x7] = useState(true);
  const [website, setWebsite] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [overview, setOverview] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('provider-confirmed');
  const [lastChecked, setLastChecked] = useState('');
  const [hospitalSlug, setHospitalSlug] = useState('');

  // Arrays
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState('');
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [departmentInput, setDepartmentInput] = useState('');
  const [facilitiesList, setFacilitiesList] = useState<string[]>([]);
  const [facilityInput, setFacilityInput] = useState('');

  // Relations: Connected Doctors
  const [allDoctors, setAllDoctors] = useState<any[]>(doctors);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');

  // Relations: Connected Laboratories
  const [allLaboratories, setAllLaboratories] = useState<any[]>(laboratories);
  const [selectedLabIds, setSelectedLabIds] = useState<string[]>([]);

  // Images
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Load doctors if empty
  useEffect(() => {
    if (doctors.length > 0) {
      setAllDoctors(doctors);
    } else {
      fetchAllPublicDoctors()
        .then((data) => {
          if (Array.isArray(data)) setAllDoctors(data);
        })
        .catch(console.error);
    }
  }, [doctors]);

  // Load laboratories if empty
  useEffect(() => {
    if (laboratories.length > 0) {
      setAllLaboratories(laboratories);
    } else {
      fetchAllPublicLaboratories()
        .then((data) => {
          if (Array.isArray(data)) setAllLaboratories(data);
        })
        .catch(console.error);
    }
  }, [laboratories]);

  // Load Hospital Data
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHospital(true);
    fetchHospitalById(hospitalId)
      .then((hosp) => {
        if (!isMounted || !hosp) return;
        setName(hosp.name || '');
        setCity(hosp.city || '');
        setArea(hosp.area || '');
        setState(hosp.state || '');
        setCountry(hosp.country || (hosp.city === 'singapore' ? 'Singapore' : 'India'));
        setAddress(hosp.address || '');
        setPincode(hosp.pincode || '');
        setFacilityType(hosp.facility_type || 'Super-Speciality Tertiary Care');
        setFacilityTypeBadge(hosp.facility_type_badge || 'Accredited Tertiary Hospital');
        setBedCount(hosp.bed_count ? String(hosp.bed_count) : '');
        setEmergency24x7(!!hosp.emergency_available_24x7);
        setWebsite(hosp.website || '');
        setMapsUrl(hosp.maps_url || '');
        setPhone(hosp.phone || '');
        setWhatsapp(hosp.whatsapp || '');
        setOverview(hosp.overview || '');
        setVerificationStatus(hosp.verification_status || 'provider-confirmed');
        setLastChecked(hosp.last_checked || new Date().toISOString().split('T')[0]);
        setHospitalSlug(hosp.slug || '');

        // Services
        if (Array.isArray(hosp.services)) {
          setServicesList(hosp.services);
        }

        // Departments
        if (Array.isArray(hosp.departments)) {
          setDepartmentsList(
            hosp.departments.map((d: any) => (typeof d === 'string' ? d : d.name || ''))
          );
        }

        // Facilities
        if (Array.isArray(hosp.facilities)) {
          setFacilitiesList(hosp.facilities);
        }

        // Connected Doctors
        if (Array.isArray(hosp.doctors)) {
          setSelectedDoctorIds(hosp.doctors.map((d: any) => d.doctor_id || d.id || ''));
        }

        // Connected Laboratories
        if (Array.isArray(hosp.connected_laboratory_ids)) {
          setSelectedLabIds(hosp.connected_laboratory_ids);
        }

        // Images
        if (Array.isArray(hosp.images)) {
          setImages(hosp.images);
        }
      })
      .catch((err) => {
        console.error('Failed to load hospital:', err);
        toast.error(`Error loading hospital: ${err.message}`);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHospital(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hospitalId]);

  // Array handlers: Services
  const handleAddService = (val?: string) => {
    const item = (val || serviceInput).trim();
    if (item && !servicesList.includes(item)) {
      setServicesList([...servicesList, item]);
      if (!val) setServiceInput('');
    }
  };
  const handleRemoveService = (item: string) => {
    setServicesList(servicesList.filter((s) => s !== item));
  };

  // Array handlers: Departments
  const handleAddDepartment = (val?: string) => {
    const item = (val || departmentInput).trim();
    if (item && !departmentsList.includes(item)) {
      setDepartmentsList([...departmentsList, item]);
      if (!val) setDepartmentInput('');
    }
  };
  const handleRemoveDepartment = (item: string) => {
    setDepartmentsList(departmentsList.filter((d) => d !== item));
  };

  // Array handlers: Facilities
  const handleAddFacility = (val?: string) => {
    const item = (val || facilityInput).trim();
    if (item && !facilitiesList.includes(item)) {
      setFacilitiesList([...facilitiesList, item]);
      if (!val) setFacilityInput('');
    }
  };
  const handleRemoveFacility = (item: string) => {
    setFacilitiesList(facilitiesList.filter((f) => f !== item));
  };

  // Relations handlers: Doctors
  const handleToggleDoctor = (docId: string) => {
    setSelectedDoctorIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Relations handlers: Labs
  const handleToggleLab = (labId: string) => {
    setSelectedLabIds((prev) =>
      prev.includes(labId) ? prev.filter((id) => id !== labId) : [...prev, labId]
    );
  };

  // Filtered doctors for selection
  const filteredDoctors = allDoctors.filter((doc) => {
    if (!doctorSearch) return true;
    const q = doctorSearch.toLowerCase();
    return (
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.speciality || '').toLowerCase().includes(q) ||
      (doc.city || '').toLowerCase().includes(q)
    );
  });

  // Images upload handler
  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingImages(true);

    try {
      const result = await uploadMultipleEntityImages(fileList, 'hospitals', hospitalId);
      if (result && result.images && result.images.length > 0) {
        const newImages: ImageItem[] = result.images.map((img, i) => ({
          url: img.url,
          card_url: img.card_url,
          alt: img.alt || `${name} Photo`,
          caption: img.caption || '',
          is_primary: images.length === 0 && i === 0,
        }));
        setImages((prev) => [...prev, ...newImages]);
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
      toast.error('Hospital name is required');
      return;
    }
    if (!city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!state.trim()) {
      toast.error('State is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Address is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        city: city.trim().toLowerCase(),
        area: area.trim(),
        state: state.trim(),
        country: country.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        facility_type: facilityType.trim(),
        facility_type_badge: facilityTypeBadge.trim(),
        bed_count: bedCount ? parseInt(bedCount, 10) : undefined,
        emergency_available_24x7: emergency24x7,
        website: website.trim(),
        maps_url: mapsUrl.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        overview: overview.trim(),
        services: servicesList,
        departments: departmentsList.map((d) => ({ name: d, slug: d.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
        facilities: facilitiesList,
        images: images,
        verification_status: verificationStatus.trim(),
        last_checked: lastChecked.trim() || new Date().toISOString().split('T')[0],
        connected_doctor_ids: selectedDoctorIds,
        connected_laboratory_ids: selectedLabIds,
      };

      const res = await updateHospital(hospitalId, payload);
      toast.success(res.message || 'Hospital updated successfully!');
      onHospitalUpdated();
    } catch (err: any) {
      console.error('Update hospital error:', err);
      toast.error(err.message || 'Failed to update hospital');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Hospital
  const handleDelete = async () => {
    const confirmName = window.prompt(
      `Are you sure you want to delete "${name}"?\nType the word "DELETE" to confirm:`
    );
    if (confirmName !== 'DELETE') return;

    setIsDeleting(true);
    try {
      await deleteHospital(hospitalId);
      toast.success(`Hospital "${name}" deleted from database`);
      onHospitalUpdated();
      onBack();
    } catch (err: any) {
      console.error('Delete hospital error:', err);
      toast.error(err.message || 'Failed to delete hospital');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingHospital) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0077b6] animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading hospital details from database...</p>
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
            <span>Back to Hospital List</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Editing Hospital ID:</span>
            <code className="text-[11px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
              {hospitalId}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hospitalSlug && (
            <a
              href={`http://localhost:3000/hospitals/${hospitalSlug}`}
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
            <span>{isDeleting ? 'Deleting...' : 'Delete Hospital'}</span>
          </button>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Basic Identity & Geographical Location */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#0077b6] border border-blue-100">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#03045e]">Hospital Identity & Location</h3>
              <p className="text-xs text-slate-500">
                Official hospital name, location, address, and facility classification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Hospital Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hospital Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Breach Candy Hospital Trust"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm font-semibold text-slate-800"
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra, Singapore"
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
                placeholder="e.g. mumbai, pune, singapore"
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
                placeholder="e.g. Cumballa Hill, Kent Ridge, Baner"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Physical Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 60 A, Bhulabhai Desai Marg, Breach Candy, Cumballa Hill, Mumbai 400026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode / Postal Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 400026, 119074"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Facility Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Facility Type</label>
              <input
                type="text"
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                placeholder="e.g. Super-Speciality Tertiary Care"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {FACILITY_TYPES.slice(0, 4).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFacilityType(type)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400 cursor-pointer"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Facility Type Badge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Facility Type Badge</label>
              <input
                type="text"
                value={facilityTypeBadge}
                onChange={(e) => setFacilityTypeBadge(e.target.value)}
                placeholder="e.g. JCI / NABH Accredited Tertiary Center"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Bed Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Bed Capacity</label>
              <input
                type="number"
                min="0"
                value={bedCount}
                onChange={(e) => setBedCount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800"
              />
            </div>

            {/* Emergency 24x7 */}
            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emergency24x7}
                  onChange={(e) => setEmergency24x7(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-xs font-bold text-slate-700">
                  24x7 Emergency Available
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: Overview & Clinical Offerings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#03045e]">
                Hospital Overview & Clinical Offerings
              </h3>
              <p className="text-xs text-slate-500">
                Detailed profile paragraph, clinical services, medical departments, and infrastructure
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Overview Paragraph */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hospital Overview (Clean Text Paragraph)
              </label>
              <textarea
                rows={4}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Provide a comprehensive paragraph detailing the hospital overview, accreditations, specialty centers, and clinical history..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077b6] text-sm text-slate-800 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Departments */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Medical Departments</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={departmentInput}
                    onChange={(e) => setDepartmentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDepartment();
                      }
                    }}
                    placeholder="Add department and press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDepartment()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {departmentsList.map((dept) => (
                    <div
                      key={dept}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <span>{dept}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(dept)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {departmentsList.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No departments added yet.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {PRESET_DEPARTMENTS.slice(0, 6).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddDepartment(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400 cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Clinical Services</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddService();
                      }
                    }}
                    placeholder="Add service and press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddService()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {servicesList.map((srv) => (
                    <div
                      key={srv}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <span>{srv}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(srv)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {servicesList.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No services added yet.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {PRESET_SERVICES.slice(0, 5).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddService(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400 cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Campus Facilities</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={facilityInput}
                    onChange={(e) => setFacilityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFacility();
                      }
                    }}
                    placeholder="Add facility and press Enter..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFacility()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {facilitiesList.map((fac) => (
                    <div
                      key={fac}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <span>{fac}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFacility(fac)}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {facilitiesList.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No facilities added yet.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {PRESET_FACILITIES.slice(0, 5).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddFacility(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400 cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Connected Doctors & Laboratories */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#03045e]">
                Connected Doctors & Medical Relations
              </h3>
              <p className="text-xs text-slate-500">
                Link attending specialists, surgeons, and partner diagnostic laboratories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connected Doctors */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Connected Doctors ({selectedDoctorIds.length} Selected)
                </label>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctors..."
                    className="w-full pl-8 pr-2.5 py-1 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0077b6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctorIds.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleToggleDoctor(doc.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="text-xs font-bold truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {doc.speciality} • {doc.city}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0077b6] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connected Laboratories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Connected Laboratories ({selectedLabIds.length} Selected)
                </label>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {allLaboratories.map((lab) => {
                  const isSelected = selectedLabIds.includes(lab.id);
                  return (
                    <button
                      key={lab.id}
                      type="button"
                      onClick={() => handleToggleLab(lab.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
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
          </div>
        </div>

        {/* SECTION 4: Contact, URLs & Verification */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#03045e]">
                Contact, Online Links & Verification
              </h3>
              <p className="text-xs text-slate-500">
                Official hospital telephone, website, Google Maps URL, and verification date
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 20 6721 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp / Helpline</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 20 6721 5000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.breachcandyhospital.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            {/* Maps URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Google Maps URL</label>
              <input
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?cid=..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
              />
            </div>

            {/* Verification Status */}
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

            {/* Last Checked */}
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

        {/* SECTION 5: Photo Gallery & Cloudflare R2 Upload */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#03045e]">Hospital Photo Gallery</h3>
                <p className="text-xs text-slate-500">
                  Upload exterior, reception, ICU, and campus photos to Cloudflare R2
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0077b6] text-xs font-bold cursor-pointer transition-all border border-blue-200">
              <Upload className="w-4 h-4" />
              <span>{isUploadingImages ? 'Uploading...' : 'Upload Photos'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFilesSelected}
                disabled={isUploadingImages}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group shadow-2xs"
              >
                <img src={img.url} alt={img.alt || name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length === 0 && (
              <div className="col-span-full py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">
                  No images uploaded yet. Click "Upload Photos" above to add gallery images.
                </p>
              </div>
            )}
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

