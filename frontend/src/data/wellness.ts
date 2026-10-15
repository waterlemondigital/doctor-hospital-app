import { Hospital } from '../types';

export const WELLNESS_CENTERS_DATA: Hospital[] = [
  {
    id: "well_01",
    slug: "kaivalyadhama-yoga-wellness-center-pune",
    name: "Kaivalyadhama Health and Yoga Research Center",
    state: "Maharashtra",
    city: "pune",
    area: "Lonavala",
    address: "Swami Kuvalayananda Marg, Lonavala, Pune District",
    pincode: "410401",
    facilityType: "Super-Speciality Tertiary Care",
    facilityTypeBadge: "Scientific Yoga & Naturopathy Center",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
        alt: "Kaivalyadhama Yoga and Wellness Center",
        caption: "Traditional yoga and scientific natural cure ashram",
      },
    ],
    overview:
      "Founded in 1924, Kaivalyadhama is one of the world's first institutions dedicated to combining scientific medical research with classical Yoga and Naturopathy, offering residential wellness retreats, stress management, and therapeutic yogic protocols.",
    services: [
      "Therapeutic Yoga for Chronic Disorders",
      "Classical Naturopathy & Hydrotherapy",
      "Mud Therapy & Steam Enemas",
      "Pranayama & Meditation Stress Relief Programs",
      "Dietary Detoxification & Sattvic Nutrition",
      "Scientific Bio-feedback Monitoring",
    ],
    departments: [
      { name: "Yoga Therapy", slug: "yoga-therapy" },
      { name: "Naturopathy", slug: "naturopathy" },
      { name: "Ayurvedic Dietetics", slug: "dietetics" },
    ],
    facilities: [
      "Residential Wellness Cottages",
      "Dedicated Naturopathy Treatment Chambers",
      "Organic Herbal Garden & Library",
      "Meditation & Asana Halls",
    ],
    emergencyAvailable24x7: false,
    website: "https://kdham.com",
    phone: "+91 2114 273 001",
    whatsapp: "+91 94220 88990",
    mapsUrl: "https://maps.google.com/?q=Kaivalyadhama+Lonavala+Pune",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-22",
    sources: [
      {
        label: "Ministry of AYUSH Recognized Center of Excellence",
        url: "https://ayush.gov.in",
        type: "official-registry",
        dateChecked: "2026-03-22",
      },
    ],
    doctorIds: [],
  },
  {
    id: "well_02",
    slug: "atmantan-wellness-center-mulshi-pune",
    name: "Atmantan Integrated Wellness Resort",
    state: "Maharashtra",
    city: "pune",
    area: "Mulshi",
    address: "Pitasphy Village, Mulshi Valley, Pune",
    pincode: "412108",
    facilityType: "Multispeciality Hospital",
    facilityTypeBadge: "NABH Accredited Wellness Retreat",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
        alt: "Atmantan Wellness Resort Mulshi",
      },
    ],
    overview:
      "An integrated NABH-accredited medical wellness resort nestled in the Sahyadri mountains of Mulshi, offering medically supervised holistic health programs integrating Ayurveda, Naturopathy, functional fitness, and stress management.",
    services: [
      "Physician-led Detoxification & Weight Management",
      "Ayurvedic Panchakarma Treatments",
      "Naturopathy & Colon Hydrotherapy",
      "Functional Posture Correction & Physiotherapy",
      "Mindfulness & Emotional Healing Programs",
    ],
    departments: [
      { name: "Integrative Medicine", slug: "integrative-medicine" },
      { name: "Ayurveda & Panchakarma", slug: "ayurveda" },
      { name: "Naturopathy", slug: "naturopathy" },
    ],
    facilities: [
      "NABH Certified Wellness Facility",
      "Hydrotherapy Pools & Cryotherapy",
      "Custom Organic Nutrition Dining",
    ],
    emergencyAvailable24x7: false,
    website: "https://atmantan.com",
    phone: "+91 20 6676 6666",
    whatsapp: "+91 98220 11999",
    mapsUrl: "https://maps.google.com/?q=Atmantan+Wellness+Resort+Mulshi+Pune",
    verificationStatus: "independently-checked",
    lastChecked: "2026-03-21",
    sources: [
      {
        label: "NABH AYUSH & Wellness Accreditation Register",
        url: "https://nabh.co",
        type: "official-registry",
        dateChecked: "2026-03-21",
      },
    ],
    doctorIds: [],
  },
];
