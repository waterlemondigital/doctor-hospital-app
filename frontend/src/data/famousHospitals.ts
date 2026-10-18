export interface FamousHospitalItem {
  rank: number;
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  state: string;
  facilityType: string;
  facilityTypeBadge: string;
  bedCount: number | null;
  emergency24x7: boolean;
  departments: string[];
  images: any[];
}

export const FAMOUS_HOSPITALS_LIST: FamousHospitalItem[] = [
  {
    "rank": 1,
    "id": "all_india_institute_of_medical_sciences_aiims_new_delhi",
    "slug": "all-india-institute-of-medical-sciences-aiims-new-delhi",
    "name": "All India Institute of Medical Sciences (AIIMS), New Delhi",
    "city": "New Delhi",
    "area": "Ansari Nagar",
    "state": "Delhi",
    "facilityType": "Government tertiary-care teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Neurology",
      "Oncology",
      "Nephrology"
    ],
    "images": []
  },
  {
    "rank": 2,
    "id": "medanta_the_medicity",
    "slug": "medanta-the-medicity",
    "name": "Medanta \u2013 The Medicity",
    "city": "Gurugram",
    "area": "Sector 38",
    "state": "Haryana",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiac Sciences",
      "Cancer Care",
      "Neurosciences",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 3,
    "id": "apollo_hospitals_greams_road",
    "slug": "apollo-hospitals-greams-road",
    "name": "Apollo Hospitals, Greams Road",
    "city": "Chennai",
    "area": "Greams Road",
    "state": "Tamil Nadu",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurology",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 4,
    "id": "tata_memorial_hospital",
    "slug": "tata-memorial-hospital",
    "name": "Tata Memorial Hospital",
    "city": "Mumbai",
    "area": "Parel",
    "state": "Maharashtra",
    "facilityType": "Public specialist cancer hospital and research centre",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Medical Oncology",
      "Surgical Oncology",
      "Radiation Oncology",
      "Onco-pathology"
    ],
    "images": []
  },
  {
    "rank": 5,
    "id": "christian_medical_college_cmc",
    "slug": "christian-medical-college-cmc",
    "name": "Christian Medical College (CMC)",
    "city": "Vellore",
    "area": "Ida Scudder Road",
    "state": "Tamil Nadu",
    "facilityType": "Non-profit teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 6,
    "id": "postgraduate_institute_of_medical_education_and_research_pgimer",
    "slug": "postgraduate-institute-of-medical-education-and-research-pgimer",
    "name": "Postgraduate Institute of Medical Education and Research (PGIMER)",
    "city": "Chandigarh",
    "area": "Sector 12",
    "state": "Chandigarh",
    "facilityType": "Public postgraduate teaching and tertiary-care institute",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Neurosciences",
      "Nephrology",
      "Endocrinology"
    ],
    "images": []
  },
  {
    "rank": 7,
    "id": "sir_ganga_ram_hospital",
    "slug": "sir-ganga-ram-hospital",
    "name": "Sir Ganga Ram Hospital",
    "city": "New Delhi",
    "area": "Old Rajinder Nagar",
    "state": "Delhi",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Gastroenterology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 8,
    "id": "kokilaben_dhirubhai_ambani_hospital",
    "slug": "kokilaben-dhirubhai-ambani-hospital",
    "name": "Kokilaben Dhirubhai Ambani Hospital",
    "city": "Mumbai",
    "area": "Andheri West",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cancer",
      "Neurosciences",
      "Cardiac Sciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 9,
    "id": "fortis_memorial_research_institute",
    "slug": "fortis-memorial-research-institute",
    "name": "Fortis Memorial Research Institute",
    "city": "Gurugram",
    "area": "Sector 44",
    "state": "Haryana",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiac Sciences",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 10,
    "id": "narayana_institute_of_cardiac_sciences",
    "slug": "narayana-institute-of-cardiac-sciences",
    "name": "Narayana Institute of Cardiac Sciences",
    "city": "Bengaluru",
    "area": "Bommasandra",
    "state": "Karnataka",
    "facilityType": "Specialist cardiac and multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Cardiothoracic Surgery",
      "Paediatric Cardiology",
      "Vascular Surgery"
    ],
    "images": []
  },
  {
    "rank": 11,
    "id": "indraprastha_apollo_hospitals",
    "slug": "indraprastha-apollo-hospitals",
    "name": "Indraprastha Apollo Hospitals",
    "city": "New Delhi",
    "area": "Sarita Vihar",
    "state": "Delhi",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Transplants"
    ],
    "images": []
  },
  {
    "rank": 12,
    "id": "max_super_speciality_hospital_saket",
    "slug": "max-super-speciality-hospital-saket",
    "name": "Max Super Speciality Hospital, Saket",
    "city": "New Delhi",
    "area": "Saket",
    "state": "Delhi",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiac Sciences",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 13,
    "id": "artemis_hospital",
    "slug": "artemis-hospital",
    "name": "Artemis Hospital",
    "city": "Gurugram",
    "area": "Sector 51",
    "state": "Haryana",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 14,
    "id": "manipal_hospital_old_airport_road",
    "slug": "manipal-hospital-old-airport-road",
    "name": "Manipal Hospital, Old Airport Road",
    "city": "Bengaluru",
    "area": "Old Airport Road",
    "state": "Karnataka",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 15,
    "id": "aster_cmi_hospital",
    "slug": "aster-cmi-hospital",
    "name": "Aster CMI Hospital",
    "city": "Bengaluru",
    "area": "Hebbal",
    "state": "Karnataka",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiac Sciences",
      "Neurosciences",
      "Oncology",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 16,
    "id": "p_d_hinduja_hospital",
    "slug": "p-d-hinduja-hospital",
    "name": "P. D. Hinduja Hospital",
    "city": "Mumbai",
    "area": "Mahim",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Neurology",
      "Oncology",
      "Nephrology"
    ],
    "images": []
  },
  {
    "rank": 17,
    "id": "lilavati_hospital_and_research_centre",
    "slug": "lilavati-hospital-and-research-centre",
    "name": "Lilavati Hospital and Research Centre",
    "city": "Mumbai",
    "area": "Bandra Reclamation",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurology",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 18,
    "id": "nanavati_max_super_speciality_hospital",
    "slug": "nanavati-max-super-speciality-hospital",
    "name": "Nanavati Max Super Speciality Hospital",
    "city": "Mumbai",
    "area": "Vile Parle West",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiac Sciences",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 19,
    "id": "ruby_hall_clinic_sassoon_road",
    "slug": "ruby-hall-clinic",
    "name": "Ruby Hall Clinic",
    "city": "Pune",
    "area": "Sassoon Road",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurology",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 20,
    "id": "deenanath_mangeshkar_hospital_and_research_center",
    "slug": "deenanath-mangeshkar-hospital-and-research-center",
    "name": "Deenanath Mangeshkar Hospital and Research Center",
    "city": "Pune",
    "area": "Erandwane",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty hospital and research centre",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Orthopaedics",
      "Neurosciences"
    ],
    "images": []
  },
  {
    "rank": 21,
    "id": "sahyadri_super_speciality_hospital",
    "slug": "sahyadri-super-speciality-hospital",
    "name": "Sahyadri Super Speciality Hospital",
    "city": "Pune",
    "area": "Deccan Gymkhana",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Neurosciences",
      "Orthopaedics",
      "Oncology"
    ],
    "images": [
      {
        "url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/88c9949c945710096ec72cf0_full.webp",
        "thumb_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/88c9949c945710096ec72cf0_thumb.webp",
        "card_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/88c9949c945710096ec72cf0_card.webp",
        "full_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/88c9949c945710096ec72cf0_full.webp",
        "alt": "Sahyadri Super Speciality Hospital - Main Building & Entrance",
        "caption": "Main Building & Entrance",
        "content_hash": "88c9949c945710096ec72cf081e92195b977118fb017451df90bdffffbfebb23"
      },
      {
        "url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/379aea59b1ee03251ec6c1bc_full.webp",
        "thumb_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/379aea59b1ee03251ec6c1bc_thumb.webp",
        "card_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/379aea59b1ee03251ec6c1bc_card.webp",
        "full_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/379aea59b1ee03251ec6c1bc_full.webp",
        "alt": "Sahyadri Super Speciality Hospital - Hospital Infrastructure & Reception",
        "caption": "Hospital Infrastructure & Reception",
        "content_hash": "379aea59b1ee03251ec6c1bcb2c44f5b5adfa2602fcf3aa8f3ec34ef9d427e9a"
      },
      {
        "url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/358d29e33046129203d5c673_full.webp",
        "thumb_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/358d29e33046129203d5c673_thumb.webp",
        "card_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/358d29e33046129203d5c673_card.webp",
        "full_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/358d29e33046129203d5c673_full.webp",
        "alt": "Sahyadri Super Speciality Hospital - Critical Care & Clinical Facilities",
        "caption": "Critical Care & Clinical Facilities",
        "content_hash": "358d29e33046129203d5c67333a896adf43f78779f18ca4b47439f9af868c773"
      },
      {
        "url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/1c241fbb31ff6c3bf71efb46_full.webp",
        "thumb_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/1c241fbb31ff6c3bf71efb46_thumb.webp",
        "card_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/1c241fbb31ff6c3bf71efb46_card.webp",
        "full_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/1c241fbb31ff6c3bf71efb46_full.webp",
        "alt": "Sahyadri Super Speciality Hospital - Speciality Diagnostics & OPD Complex",
        "caption": "Speciality Diagnostics & OPD Complex",
        "content_hash": "1c241fbb31ff6c3bf71efb46f7735a7cd2dd0c3795f49aebb1bf18180506b224"
      },
      {
        "url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/08a19ebf1816d2ad87597ba7_full.webp",
        "thumb_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/08a19ebf1816d2ad87597ba7_thumb.webp",
        "card_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/08a19ebf1816d2ad87597ba7_card.webp",
        "full_url": "https://pub-151166afd0294cb99a7c59679d424908.r2.dev/hospitals/sahyadri_super_speciality_hospital/08a19ebf1816d2ad87597ba7_full.webp",
        "alt": "Sahyadri Super Speciality Hospital - Emergency & Patient Care Services",
        "caption": "Emergency & Patient Care Services",
        "content_hash": "08a19ebf1816d2ad87597ba753bad0989085e731a11d87957e19ace4f8e22eff"
      }
    ]
  },
  {
    "rank": 22,
    "id": "kims_hospitals",
    "slug": "kims-hospitals",
    "name": "KIMS Hospitals",
    "city": "Hyderabad",
    "area": "Secunderabad",
    "state": "Telangana",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 23,
    "id": "yashoda_hospitals",
    "slug": "yashoda-hospitals",
    "name": "Yashoda Hospitals",
    "city": "Hyderabad",
    "area": "Somajiguda",
    "state": "Telangana",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Organ Transplants"
    ],
    "images": []
  },
  {
    "rank": 24,
    "id": "continental_hospitals",
    "slug": "continental-hospitals",
    "name": "Continental Hospitals",
    "city": "Hyderabad",
    "area": "Gachibowli",
    "state": "Telangana",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 25,
    "id": "gleneagles_hospital",
    "slug": "gleneagles-hospital",
    "name": "Gleneagles Hospital",
    "city": "Chennai",
    "area": "Perumbakkam",
    "state": "Tamil Nadu",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Liver Transplant",
      "Renal Sciences",
      "Cardiology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 26,
    "id": "miot_international",
    "slug": "miot-international",
    "name": "MIOT International",
    "city": "Chennai",
    "area": "Manapakkam",
    "state": "Tamil Nadu",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Orthopaedics",
      "Cardiology",
      "Oncology",
      "Neurosciences"
    ],
    "images": []
  },
  {
    "rank": 27,
    "id": "sri_ramachandra_medical_centre",
    "slug": "sri-ramachandra-medical-centre",
    "name": "Sri Ramachandra Medical Centre",
    "city": "Chennai",
    "area": "Porur",
    "state": "Tamil Nadu",
    "facilityType": "Teaching hospital and medical university centre",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Oncology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 28,
    "id": "aster_medcity",
    "slug": "aster-medcity",
    "name": "Aster Medcity",
    "city": "Kochi",
    "area": "Cheranalloor",
    "state": "Kerala",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Transplants"
    ],
    "images": []
  },
  {
    "rank": 29,
    "id": "amrita_hospital",
    "slug": "amrita-hospital",
    "name": "Amrita Hospital",
    "city": "Faridabad",
    "area": "Sector 88",
    "state": "Haryana",
    "facilityType": "Private multispecialty teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Transplants"
    ],
    "images": []
  },
  {
    "rank": 30,
    "id": "rajagiri_hospital",
    "slug": "rajagiri-hospital",
    "name": "Rajagiri Hospital",
    "city": "Aluva",
    "area": "Chunangamvely",
    "state": "Kerala",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 31,
    "id": "zydus_hospitals",
    "slug": "zydus-hospitals",
    "name": "Zydus Hospitals",
    "city": "Ahmedabad",
    "area": "Thaltej",
    "state": "Gujarat",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 32,
    "id": "apollo_hospitals_ahmedabad",
    "slug": "apollo-hospitals-ahmedabad",
    "name": "Apollo Hospitals, Ahmedabad",
    "city": "Ahmedabad",
    "area": "Gandhinagar Highway",
    "state": "Gujarat",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 33,
    "id": "shalby_multispecialty_hospital",
    "slug": "shalby-multispecialty-hospital",
    "name": "Shalby Multispecialty Hospital",
    "city": "Ahmedabad",
    "area": "SG Highway",
    "state": "Gujarat",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Orthopaedics",
      "Joint Replacement",
      "Cardiology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 34,
    "id": "narayana_multispeciality_hospital",
    "slug": "narayana-multispeciality-hospital",
    "name": "Narayana Multispeciality Hospital",
    "city": "Ahmedabad",
    "area": "Rakhial",
    "state": "Gujarat",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 35,
    "id": "kalinga_institute_of_medical_sciences_kims",
    "slug": "kalinga-institute-of-medical-sciences-kims",
    "name": "Kalinga Institute of Medical Sciences (KIMS)",
    "city": "Bhubaneswar",
    "area": "Patia",
    "state": "Odisha",
    "facilityType": "Teaching hospital and medical college",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 36,
    "id": "apollo_hospitals_bhubaneswar",
    "slug": "apollo-hospitals-bhubaneswar",
    "name": "Apollo Hospitals, Bhubaneswar",
    "city": "Bhubaneswar",
    "area": "Sailashree Vihar",
    "state": "Odisha",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 37,
    "id": "sum_hospital",
    "slug": "sum-hospital",
    "name": "SUM Hospital",
    "city": "Bhubaneswar",
    "area": "Kalinga Nagar",
    "state": "Odisha",
    "facilityType": "Teaching hospital and medical college",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 38,
    "id": "sanjay_gandhi_postgraduate_institute_of_medical_sciences_sgpgims",
    "slug": "sanjay-gandhi-postgraduate-institute-of-medical-sciences-sgpgims",
    "name": "Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGIMS)",
    "city": "Lucknow",
    "area": "Raebareli Road",
    "state": "Uttar Pradesh",
    "facilityType": "Public postgraduate tertiary-care institute",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Neurology",
      "Nephrology",
      "Endocrinology"
    ],
    "images": []
  },
  {
    "rank": 39,
    "id": "king_george_s_medical_university_kgmu",
    "slug": "king-george-s-medical-university-kgmu",
    "name": "King George\u2019s Medical University (KGMU)",
    "city": "Lucknow",
    "area": "Chowk",
    "state": "Uttar Pradesh",
    "facilityType": "Public teaching hospital and medical university",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 40,
    "id": "medanta",
    "slug": "medanta",
    "name": "Medanta",
    "city": "Lucknow",
    "area": "Amar Shaheed Path",
    "state": "Uttar Pradesh",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 41,
    "id": "sawai_man_singh_sms_hospital",
    "slug": "sawai-man-singh-sms-hospital",
    "name": "Sawai Man Singh (SMS) Hospital",
    "city": "Jaipur",
    "area": "JLN Marg",
    "state": "Rajasthan",
    "facilityType": "Public teaching and tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 42,
    "id": "eternal_hospital",
    "slug": "eternal-hospital",
    "name": "Eternal Hospital",
    "city": "Jaipur",
    "area": "Jawahar Circle",
    "state": "Rajasthan",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Cardiac Surgery",
      "Oncology",
      "Neurosciences"
    ],
    "images": []
  },
  {
    "rank": 43,
    "id": "fortis_escorts_hospital",
    "slug": "fortis-escorts-hospital",
    "name": "Fortis Escorts Hospital",
    "city": "Jaipur",
    "area": "Malviya Nagar",
    "state": "Rajasthan",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Cardiac Surgery",
      "Orthopaedics",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 44,
    "id": "choithram_hospital_and_research_centre",
    "slug": "choithram-hospital-and-research-centre",
    "name": "Choithram Hospital and Research Centre",
    "city": "Indore",
    "area": "Manik Bagh Road",
    "state": "Madhya Pradesh",
    "facilityType": "Charitable teaching and multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Nephrology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 45,
    "id": "bombay_hospital",
    "slug": "bombay-hospital",
    "name": "Bombay Hospital",
    "city": "Indore",
    "area": "Ring Road",
    "state": "Madhya Pradesh",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Neurology",
      "Orthopaedics",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 46,
    "id": "sri_aurobindo_institute_of_medical_sciences",
    "slug": "sri-aurobindo-institute-of-medical-sciences",
    "name": "Sri Aurobindo Institute of Medical Sciences",
    "city": "Indore",
    "area": "Sanwer Road",
    "state": "Madhya Pradesh",
    "facilityType": "Teaching hospital and medical college",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 47,
    "id": "government_medical_college_and_hospital_gmch",
    "slug": "government-medical-college-and-hospital-gmch",
    "name": "Government Medical College and Hospital (GMCH)",
    "city": "Chandigarh",
    "area": "Sector 32",
    "state": "Chandigarh",
    "facilityType": "Public teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 48,
    "id": "amrita_hospital",
    "slug": "amrita-hospital",
    "name": "Amrita Hospital",
    "city": "Faridabad",
    "area": "Sector 88",
    "state": "Haryana",
    "facilityType": "Private multispecialty teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Transplants"
    ],
    "images": []
  },
  {
    "rank": 49,
    "id": "jawaharlal_institute_of_postgraduate_medical_education_and_resea",
    "slug": "jawaharlal-institute-of-postgraduate-medical-education-and-research-jipmer",
    "name": "Jawaharlal Institute of Postgraduate Medical Education and Research (JIPMER)",
    "city": "Puducherry",
    "area": "Dhanvantari Nagar",
    "state": "Puducherry",
    "facilityType": "Public teaching and tertiary-care institute",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Nephrology"
    ],
    "images": []
  },
  {
    "rank": 50,
    "id": "tata_main_hospital",
    "slug": "tata-main-hospital",
    "name": "Tata Main Hospital",
    "city": "Jamshedpur",
    "area": "Bistupur",
    "state": "Jharkhand",
    "facilityType": "Multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 51,
    "id": "rajendra_institute_of_medical_sciences_rims",
    "slug": "rajendra-institute-of-medical-sciences-rims",
    "name": "Rajendra Institute of Medical Sciences (RIMS)",
    "city": "Ranchi",
    "area": "Bariatu",
    "state": "Jharkhand",
    "facilityType": "Public teaching and tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 52,
    "id": "indira_gandhi_institute_of_medical_sciences_igims",
    "slug": "indira-gandhi-institute-of-medical-sciences-igims",
    "name": "Indira Gandhi Institute of Medical Sciences (IGIMS)",
    "city": "Patna",
    "area": "Sheikhpura",
    "state": "Bihar",
    "facilityType": "Public teaching and tertiary-care institute",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 53,
    "id": "aiims_patna",
    "slug": "aiims-patna",
    "name": "AIIMS Patna",
    "city": "Patna",
    "area": "Phulwari Sharif",
    "state": "Bihar",
    "facilityType": "Public tertiary-care teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 54,
    "id": "aiims_jodhpur",
    "slug": "aiims-jodhpur",
    "name": "AIIMS Jodhpur",
    "city": "Jodhpur",
    "area": "Basni Phase-II",
    "state": "Rajasthan",
    "facilityType": "Public tertiary-care teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 55,
    "id": "aiims_rishikesh",
    "slug": "aiims-rishikesh",
    "name": "AIIMS Rishikesh",
    "city": "Rishikesh",
    "area": "Virbhadra Marg",
    "state": "Uttarakhand",
    "facilityType": "Public tertiary-care teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 56,
    "id": "aiims_bhopal",
    "slug": "aiims-bhopal",
    "name": "AIIMS Bhopal",
    "city": "Bhopal",
    "area": "Saket Nagar",
    "state": "Madhya Pradesh",
    "facilityType": "Public tertiary-care teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 57,
    "id": "aiims_bhubaneswar",
    "slug": "aiims-bhubaneswar",
    "name": "AIIMS Bhubaneswar",
    "city": "Bhubaneswar",
    "area": "Sijua",
    "state": "Odisha",
    "facilityType": "Public tertiary-care teaching hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 58,
    "id": "government_medical_college",
    "slug": "government-medical-college",
    "name": "Government Medical College",
    "city": "Thiruvananthapuram",
    "area": "Medical College PO",
    "state": "Kerala",
    "facilityType": "Public teaching and tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Surgery",
      "Cardiology",
      "Neurology"
    ],
    "images": []
  },
  {
    "rank": 59,
    "id": "kovai_medical_center_and_hospital_kmch",
    "slug": "kovai-medical-center-and-hospital-kmch",
    "name": "Kovai Medical Center and Hospital (KMCH)",
    "city": "Coimbatore",
    "area": "Avinashi Road",
    "state": "Tamil Nadu",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurology",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 60,
    "id": "psg_hospitals",
    "slug": "psg-hospitals",
    "name": "PSG Hospitals",
    "city": "Coimbatore",
    "area": "Peelamedu",
    "state": "Tamil Nadu",
    "facilityType": "Teaching and multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "General Medicine",
      "Cardiology",
      "Neurology",
      "Oncology"
    ],
    "images": []
  },
  {
    "rank": 61,
    "id": "ganga_hospital",
    "slug": "ganga-hospital",
    "name": "Ganga Hospital",
    "city": "Coimbatore",
    "area": "Mettupalayam Road",
    "state": "Tamil Nadu",
    "facilityType": "Specialist orthopaedics and trauma hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Orthopaedics",
      "Trauma",
      "Plastic Surgery",
      "Hand Surgery"
    ],
    "images": []
  },
  {
    "rank": 62,
    "id": "care_hospitals",
    "slug": "care-hospitals",
    "name": "CARE Hospitals",
    "city": "Hyderabad",
    "area": "Banjara Hills",
    "state": "Telangana",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 63,
    "id": "noble_hospitals_research_centre",
    "slug": "noble-hospitals-research-centre",
    "name": "Noble Hospitals & Research Centre",
    "city": "Pune",
    "area": "Hadapsar",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurology",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 64,
    "id": "jupiter_hospital_baner",
    "slug": "jupiter-hospital",
    "name": "Jupiter Hospital",
    "city": "Pune",
    "area": "Baner",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 65,
    "id": "jehangir_hospital",
    "slug": "jehangir-hospital",
    "name": "Jehangir Hospital",
    "city": "Pune",
    "area": "Sassoon Road",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurology",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 66,
    "id": "kem_hospital_pune",
    "slug": "kem-hospital",
    "name": "KEM Hospital",
    "city": "Pune",
    "area": "Rasta Peth",
    "state": "Maharashtra",
    "facilityType": "Charitable teaching and multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Neurology",
      "Oncology",
      "General Medicine"
    ],
    "images": []
  },
  {
    "rank": 67,
    "id": "manipal_hospital_kharadi",
    "slug": "manipal-hospital",
    "name": "Manipal Hospital, Kharadi",
    "city": "Pune",
    "area": "Kharadi",
    "state": "Maharashtra",
    "facilityType": "Private multispecialty hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  },
  {
    "rank": 68,
    "id": "apollo_hospitals_bengaluru",
    "slug": "apollo-hospitals-bengaluru",
    "name": "Apollo Hospitals, Bengaluru",
    "city": "Bengaluru",
    "area": "Bannerghatta Road",
    "state": "Karnataka",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiology",
      "Oncology",
      "Neurosciences",
      "Gastroenterology"
    ],
    "images": []
  },
  {
    "rank": 69,
    "id": "fortis_hospital_bannerghatta_road",
    "slug": "fortis-hospital-bannerghatta-road",
    "name": "Fortis Hospital, Bannerghatta Road",
    "city": "Bengaluru",
    "area": "Bannerghatta Road",
    "state": "Karnataka",
    "facilityType": "Private multispecialty tertiary-care hospital",
    "facilityTypeBadge": "Major public/private tertiary-care facility",
    "bedCount": null,
    "emergency24x7": true,
    "departments": [
      "Cardiac Sciences",
      "Oncology",
      "Neurosciences",
      "Orthopaedics"
    ],
    "images": []
  }
];
