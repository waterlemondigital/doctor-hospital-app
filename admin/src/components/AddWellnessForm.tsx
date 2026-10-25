import React, { useState } from 'react';
import {
  Sparkles,
  Leaf,
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
  RotateCcw,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileText,
  Star,
  Trash2,
  Heart,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';
import { createWellnessCenter, uploadMultipleEntityImages } from '../api/client';

interface AddWellnessFormProps {
  onWellnessCreated?: () => void;
}

interface ImageItem {
  url: string;
  card_url?: string;
  alt: string;
  caption?: string;
  is_primary?: boolean;
}

const PRESET_CATEGORIES = [
  'Classical Yoga & Scientific Naturopathy',
  'NABH-Accredited Integrated Medical Wellness Resort',
  'Ayurvedic Rejuvenation & Detox Retreat',
  'Holistic Naturopathy & Yoga Sanctuary',
  'Integrative Medicine & Longevity Center',
  'Meditation & Mind-Body Health Sanctuary',
];

const PRESET_ACCREDITATIONS = [
  'Ministry of AYUSH Recognized Center of Excellence',
  'NABH Accredited Wellness Retreat',
  'NABH Certified AYUSH Wellness Hospital',
  'ISO 9001:2015 Certified Holistic Health Sanctuary',
  'State Government AYUSH Board Empanelled',
];

const PRESET_PROGRAMS = [
  'Therapeutic Yoga for Chronic Lifestyle Disorders',
  'Classical Naturopathy & Hydrotherapy Protocols',
  'Scientific Pranayama & Stress Relief Programs',
  'Mud Packs, Steam Baths & Herbal Detox',
  'Dietary Detoxification & Sattvic Organic Nutrition',
  'Physician-led Detoxification & Weight Management',
  'Ayurvedic Panchakarma & Restorative Body Therapies',
  'Naturopathy Colon Cleansing & Hydrotherapy',
  'Functional Posture Correction & Physiotherapy',
  'Mindfulness, Sound Healing & Emotional Wellness',
];

const PRESET_DISCIPLINES = [
  'Yoga Therapy & Research',
  'Clinical Naturopathy',
  'Ayurvedic Dietetics & Lifestyle Counselling',
  'Integrative Holistic Medicine',
  'Ayurveda & Classical Panchakarma',
  'Naturopathy & Lifestyle Management',
  'Functional Fitness & Yoga',
];

const PRESET_FACILITIES = [
  'Residential Wellness Cottages Surrounded by Nature',
  'Dedicated Naturopathy Treatment Chambers',
  'Organic Herbal Garden & Rare Yoga Manuscript Library',
  'Meditation & Asana Halls',
  'Luxury Mountain-View Recovery Villas',
  'High-Tech Hydrotherapy Pools & Cryotherapy',
  'Farm-to-Table Custom Organic Nutrition Dining',
  'Dedicated Thermal Suites & Physiotherapy Gymnasium',
];

export function AddWellnessForm({ onWellnessCreated }: AddWellnessFormProps) {
  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Classical Yoga & Scientific Naturopathy');
  const [state, setState] = useState('Maharashtra');
  const [city, setCity] = useState('Pune');
  const [area, setArea] = useState('Lonavala');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [accreditation, setAccreditation] = useState('Ministry of AYUSH Recognized Center of Excellence');
  const [phone, setPhone] = useState('+91 2114 273 001');
  const [whatsapp, setWhatsapp] = useState('+91 94220 88990');
  const [website, setWebsite] = useState('https://kdham.com');
  const [mapsUrl, setMapsUrl] = useState('https://maps.google.com/?q=Kaivalyadhama+Lonavala+Pune');
  const [overview, setOverview] = useState('');

  // Lists State
  const [programs, setPrograms] = useState<string[]>([
    'Therapeutic Yoga for Chronic Lifestyle Disorders',
    'Classical Naturopathy & Hydrotherapy Protocols',
    'Scientific Pranayama & Stress Relief Programs',
    'Mud Packs, Steam Baths & Herbal Detox',
    'Dietary Detoxification & Sattvic Organic Nutrition',
  ]);
  const [programInput, setProgramInput] = useState('');

  const [disciplines, setDisciplines] = useState<string[]>([
    'Yoga Therapy & Research',
    'Clinical Naturopathy',
    'Ayurvedic Dietetics & Lifestyle Counselling',
  ]);
  const [disciplineInput, setDisciplineInput] = useState('');

  const [facilities, setFacilities] = useState<string[]>([
    'Residential Wellness Cottages Surrounded by Nature',
    'Dedicated Naturopathy Treatment Chambers',
    'Organic Herbal Garden & Rare Yoga Manuscript Library',
    'Meditation & Asana Halls',
  ]);
  const [facilityInput, setFacilityInput] = useState('');

  // Images State (Max 50)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Template Loader
  const handleLoadKaivalyadhamaTemplate = () => {
    setName('Kaivalyadhama Health and Yoga Research Center');
    setCategory('Classical Yoga & Scientific Naturopathy');
    setState('Maharashtra');
    setCity('Pune');
    setArea('Lonavala');
    setAddress('Swami Kuvalayananda Marg, Lonavala, Pune District');
    setPincode('410401');
    setAccreditation('Ministry of AYUSH Recognized Center of Excellence');
    setPhone('+91 2114 273 001');
    setWhatsapp('+91 94220 88990');
    setWebsite('https://kdham.com');
    setMapsUrl('https://maps.google.com/?q=Kaivalyadhama+Lonavala+Pune');
    setOverview(
      "Founded in 1924, Kaivalyadhama is one of the world's foremost institutions dedicated to combining scientific medical research with classical Yoga and Naturopathy, offering residential wellness retreats, therapeutic yoga protocols, and holistic detoxification."
    );
    setPrograms([
      'Therapeutic Yoga for Chronic Lifestyle Disorders',
      'Classical Naturopathy & Hydrotherapy Protocols',
      'Scientific Pranayama & Stress Relief Programs',
      'Mud Packs, Steam Baths & Herbal Detox',
      'Dietary Detoxification & Sattvic Organic Nutrition',
    ]);
    setDisciplines([
      'Yoga Therapy & Research',
      'Clinical Naturopathy',
      'Ayurvedic Dietetics & Lifestyle Counselling',
    ]);
    setFacilities([
      'Residential Wellness Cottages Surrounded by Nature',
      'Dedicated Naturopathy Treatment Chambers',
      'Organic Herbal Garden & Rare Yoga Manuscript Library',
      'Meditation & Asana Halls',
    ]);
    toast.success('Loaded Kaivalyadhama test template!');
  };

  const handleLoadAtmantanTemplate = () => {
    setName('Atmantan Integrated Wellness Resort');
    setCategory('NABH-Accredited Integrated Medical Wellness Resort');
    setState('Maharashtra');
    setCity('Pune');
    setArea('Mulshi');
    setAddress('Pitasphy Village, Mulshi Valley, Pune');
    setPincode('412108');
    setAccreditation('NABH Accredited Wellness Retreat');
    setPhone('+91 20 6676 6666');
    setWhatsapp('+91 98220 11999');
    setWebsite('https://atmantan.com');
    setMapsUrl('https://maps.google.com/?q=Atmantan+Wellness+Resort+Mulshi+Pune');
    setOverview(
      'An integrated NABH-accredited medical wellness resort nestled in the Sahyadri mountains of Mulshi, offering medically supervised holistic health programs integrating Ayurveda, Naturopathy, functional fitness, and emotional healing.'
    );
    setPrograms([
      'Physician-led Detoxification & Weight Management',
      'Ayurvedic Panchakarma & Restorative Body Therapies',
      'Naturopathy Colon Cleansing & Hydrotherapy',
      'Functional Posture Correction & Physiotherapy',
      'Mindfulness, Sound Healing & Emotional Wellness',
    ]);
    setDisciplines([
      'Integrative Holistic Medicine',
      'Ayurveda & Classical Panchakarma',
      'Naturopathy & Lifestyle Management',
      'Functional Fitness & Yoga',
    ]);
    setFacilities([
      'Luxury Mountain-View Recovery Villas',
      'High-Tech Hydrotherapy Pools & Cryotherapy',
      'Farm-to-Table Custom Organic Nutrition Dining',
      'Dedicated Thermal Suites & Physiotherapy Gymnasium',
    ]);
    toast.success('Loaded Atmantan template!');
  };

  // Reset form
  const handleReset = () => {
    setName('');
    setCategory('Classical Yoga & Scientific Naturopathy');
    setState('Maharashtra');
    setCity('Pune');
    setArea('');
    setAddress('');
    setPincode('');
    setAccreditation('Ministry of AYUSH Recognized Center of Excellence');
    setPhone('');
    setWhatsapp('');
    setWebsite('');
    setMapsUrl('');
    setOverview('');
    setPrograms([]);
    setDisciplines([]);
    setFacilities([]);
    setImages([]);
    toast.info('Form cleared.');
  };

  // Tag helper
  const addTag = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const val = value.trim();
    if (!val) return;
    if (currentList.includes(val)) {
      toast.warning('Item already added');
      return;
    }
    setList([...currentList, val]);
    setInput('');
  };

  const removeTag = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setList(currentList.filter((_, idx) => idx !== index));
  };

  // Batch Image Upload Handler (Max 50 images)
  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 50) {
      toast.error(`Maximum 50 images allowed. You can only add ${50 - images.length} more.`);
      return;
    }

    setIsUploadingImages(true);
    const toastId = toast.loading(`Uploading and optimizing ${files.length} images to Cloudflare R2...`);

    try {
      const fileList = Array.from(files);
      const tempId = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'wellness_temp';
      const res = await uploadMultipleEntityImages(fileList, 'wellness', tempId);

      if (res && res.images && res.images.length > 0) {
        const newImages: ImageItem[] = res.images.map((img, i) => ({
          url: img.url,
          card_url: img.card_url,
          alt: `${name || 'Wellness Center'} campus photo ${images.length + i + 1}`,
          caption: `${name || 'Wellness Center'} retreat facility`,
          is_primary: images.length === 0 && i === 0,
        }));

        setImages((prev) => [...prev, ...newImages]);
        toast.success(`Successfully uploaded ${res.images.length} images to Cloudflare R2!`, { id: toastId });
      }
    } catch (err: any) {
      console.error('Batch image upload failed:', err);
      toast.error(err.message || 'Image upload failed. Please try again.', { id: toastId });
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
    toast.success('Updated primary hero photo.');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (prev[index]?.is_primary && filtered.length > 0) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter the wellness center name');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter the full campus address');
      return;
    }
    if (!pincode.trim()) {
      toast.error('Please enter a valid pincode');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(`Registering and publishing "${name}"...`);

    try {
      const res = await createWellnessCenter({
        name: name.trim(),
        category: category.trim(),
        state: state.trim(),
        city: city.trim(),
        area: area.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        accreditation: accreditation.trim() || undefined,
        overview: overview.trim() || undefined,
        phone: phone ? phone.trim() : undefined,
        whatsapp: whatsapp ? whatsapp.trim() : undefined,
        website: website.trim() || undefined,
        maps_url: mapsUrl.trim() || undefined,
        programs,
        disciplines,
        facilities,
        images,
      });

      toast.success(res.message || `Wellness Center "${name}" registered successfully!`, { id: toastId });

      if (onWellnessCreated) {
        onWellnessCreated();
      }

      window.open(res.frontendUrl || `/wellness/${res.wellness?.slug}`, '_blank');
    } catch (err: any) {
      console.error('Failed to create wellness center:', err);
      toast.error(err.message || 'Failed to register wellness center.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner & Quick Template Buttons */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-[#03045e] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wellness Sanctuary & Retreat Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Add Wellness Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Register licensed Yoga, Naturopathy, Ayurvedic resorts, and mind-body sanctuaries. Supports up to 50 Cloudflare R2 photos with WebP compression.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadKaivalyadhamaTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Load Kaivalyadhama Template</span>
            </button>
            <button
              type="button"
              onClick={handleLoadAtmantanTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Load Atmantan Template</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold transition-all border border-red-400/30 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Core Center Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#03045e]">
              1. Center Identity & Accreditations
            </h2>
            <p className="text-xs text-slate-500">
              Basic branding, wellness category, and official governing recognitions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>Center Official Name</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kaivalyadhama Health and Yoga Research Center"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Wellness Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Accreditation & Approvals</label>
            <input
              type="text"
              value={accreditation}
              onChange={(e) => setAccreditation(e.target.value)}
              placeholder="e.g. Ministry of AYUSH Recognized Center of Excellence"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_ACCREDITATIONS.map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => setAccreditation(acc)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Location & Geographic Address */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#03045e]">
              2. Campus Location & Physical Address
            </h2>
            <p className="text-xs text-slate-500">
              City, district, neighborhood, and Google Maps direction anchor
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">City / District</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pune"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Area / Valley / Suburb</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Lonavala or Mulshi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">State</label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Maharashtra"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>Full Campus Address</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Swami Kuvalayananda Marg, Lonavala, Pune District"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>Pincode</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 410401"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>Google Maps URL</span>
            </label>
            <input
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Official Website & Online Portal */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#03045e]">
              3. Official Website & Digital Coordinates
            </h2>
            <p className="text-xs text-slate-500">
              Official retreat portal and online brochure (Phone & WhatsApp inquiries are managed centrally on frontend)
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Official Website URL</label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://kdham.com"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Center Overview Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#03045e]">
              4. Center Overview & Heritage
            </h2>
            <p className="text-xs text-slate-500">
              Detailed editorial introduction displayed prominently on the wellness profile
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
          placeholder="e.g. Founded in 1924, Kaivalyadhama is one of the world's foremost institutions dedicated to combining scientific medical research with classical Yoga and Naturopathy..."
          className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-normal"
        />
      </div>

      {/* 5. Programs, Disciplines & Campus Facilities */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#03045e]">
              5. Wellness Offerings, Specialties & Facilities
            </h2>
            <p className="text-xs text-slate-500">
              Interactive tag managers for therapeutic programs, clinical disciplines, and campus amenities
            </p>
          </div>
        </div>

        {/* 5A. Programs & Treatments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Programs & Treatments ({programs.length})</span>
            </label>
            <span className="text-[11px] text-slate-400">Press Enter or click + Add</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={programInput}
              onChange={(e) => setProgramInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(programs, setPrograms, programInput, setProgramInput);
                }
              }}
              placeholder="e.g. Therapeutic Yoga for Chronic Lifestyle Disorders"
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => addTag(programs, setPrograms, programInput, setProgramInput)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_PROGRAMS.map((prog) => (
              <button
                key={prog}
                type="button"
                onClick={() => {
                  if (!programs.includes(prog)) {
                    setPrograms([...programs, prog]);
                  }
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  programs.includes(prog)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
              >
                + {prog}
              </button>
            ))}
          </div>

          {/* Active chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {programs.map((prog, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{prog}</span>
                <button
                  type="button"
                  onClick={() => removeTag(programs, setPrograms, idx)}
                  className="hover:text-red-600 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 5B. Disciplines & Departments */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Disciplines & Specialties ({disciplines.length})</span>
            </label>
            <span className="text-[11px] text-slate-400">Press Enter or click + Add</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={disciplineInput}
              onChange={(e) => setDisciplineInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(disciplines, setDisciplines, disciplineInput, setDisciplineInput);
                }
              }}
              placeholder="e.g. Yoga Therapy & Research"
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => addTag(disciplines, setDisciplines, disciplineInput, setDisciplineInput)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_DISCIPLINES.map((disc) => (
              <button
                key={disc}
                type="button"
                onClick={() => {
                  if (!disciplines.includes(disc)) {
                    setDisciplines([...disciplines, disc]);
                  }
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  disciplines.includes(disc)
                    ? 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
              >
                + {disc}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {disciplines.map((disc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-medium"
              >
                <span>{disc}</span>
                <button
                  type="button"
                  onClick={() => removeTag(disciplines, setDisciplines, idx)}
                  className="hover:text-red-600 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 5C. Campus Facilities */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Campus Amenities & Facilities ({facilities.length})</span>
            </label>
            <span className="text-[11px] text-slate-400">Press Enter or click + Add</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={facilityInput}
              onChange={(e) => setFacilityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(facilities, setFacilities, facilityInput, setFacilityInput);
                }
              }}
              placeholder="e.g. Residential Wellness Cottages Surrounded by Nature"
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => addTag(facilities, setFacilities, facilityInput, setFacilityInput)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_FACILITIES.map((fac) => (
              <button
                key={fac}
                type="button"
                onClick={() => {
                  if (!facilities.includes(fac)) {
                    setFacilities([...facilities, fac]);
                  }
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  facilities.includes(fac)
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
              >
                + {fac}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {facilities.map((fac, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-medium"
              >
                <span>{fac}</span>
                <button
                  type="button"
                  onClick={() => removeTag(facilities, setFacilities, idx)}
                  className="hover:text-red-600 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Facility Photos & Cloudflare R2 Media Gallery (Up to 50 Images) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#03045e]">
                6. Campus Photos & Cloudflare R2 Media Gallery
              </h2>
              <p className="text-xs text-slate-500">
                Upload up to 50 photos. Automatically converts to WebP with dual responsive breakpoints.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {images.length} / 50 Photos
          </span>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-8 text-center transition-colors bg-slate-50/50">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              {isUploadingImages ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                {isUploadingImages ? 'Uploading & Optimizing Images...' : 'Choose multiple photos or drop them here'}
              </p>
              <p className="text-xs text-slate-500">
                Supports JPEG, PNG, WebP up to 10MB per file. Maximum 50 images total.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#005f92] text-white text-xs font-bold transition-all cursor-pointer shadow-xs">
              <Upload className="w-4 h-4" />
              <span>Select Photos (Max 50)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={isUploadingImages || images.length >= 50}
                onChange={handleImageFilesSelected}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Uploaded Gallery Grid */}
        {images.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Uploaded Media Assets ({images.length})</span>
              <span className="text-[11px] text-slate-400">Click star to set as hero banner photo</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all bg-slate-100 aspect-4/3 flex flex-col justify-between ${
                    img.is_primary ? 'border-amber-400 ring-2 ring-amber-300' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={img.card_url || img.url}
                    alt={img.alt || 'Campus Photo'}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {img.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Primary Hero</span>
                    </div>
                  )}

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      title="Set as Hero Cover Image"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                        img.is_primary
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/80 hover:bg-white text-slate-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${img.is_primary ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      title="Remove Photo"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button Bar */}
      <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">
            Published directly to Neon PostgreSQL & refreshed in search directory
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0077b6] hover:bg-[#005f92] text-white text-xs sm:text-sm font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Center...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publish Wellness Center</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
