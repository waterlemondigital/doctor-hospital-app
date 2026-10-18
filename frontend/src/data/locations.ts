import { StateLocation } from '../types';

/**
 * Geographic coverage data.
 * Extended with all famous healthcare hubs across India.
 */
export const LOCATIONS_DATA: StateLocation[] = [
  {
    id: "maharashtra",
    name: "Maharashtra",
    isActive: true,
    cities: [
      {
        id: "pune",
        name: "Pune",
        stateId: "maharashtra",
        isActive: true,
        hospitalCount: 10,
      },
      {
        id: "mumbai",
        name: "Mumbai MMR",
        stateId: "maharashtra",
        isActive: false,
        hospitalCount: 0,
      },
      {
        id: "nagpur",
        name: "Nagpur",
        stateId: "maharashtra",
        isActive: false,
        hospitalCount: 0,
      },
      {
        id: "nashik",
        name: "Nashik",
        stateId: "maharashtra",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    isActive: false,
    cities: [
      {
        id: "chennai",
        name: "Chennai",
        stateId: "tamil-nadu",
        isActive: false,
        hospitalCount: 0,
      },
      {
        id: "coimbatore",
        name: "Coimbatore",
        stateId: "tamil-nadu",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "delhi-ncr",
    name: "Delhi NCR",
    isActive: false,
    cities: [
      {
        id: "delhi-ncr",
        name: "Delhi NCR",
        stateId: "delhi-ncr",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "telangana",
    name: "Telangana",
    isActive: false,
    cities: [
      {
        id: "hyderabad",
        name: "Hyderabad",
        stateId: "telangana",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "karnataka",
    name: "Karnataka",
    isActive: false,
    cities: [
      {
        id: "bengaluru",
        name: "Bengaluru",
        stateId: "karnataka",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "gujarat",
    name: "Gujarat",
    isActive: false,
    cities: [
      {
        id: "ahmedabad",
        name: "Ahmedabad",
        stateId: "gujarat",
        isActive: false,
        hospitalCount: 0,
      },
      {
        id: "surat",
        name: "Surat",
        stateId: "gujarat",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "west-bengal",
    name: "West Bengal",
    isActive: false,
    cities: [
      {
        id: "kolkata",
        name: "Kolkata",
        stateId: "west-bengal",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "kerala",
    name: "Kerala",
    isActive: false,
    cities: [
      {
        id: "kochi",
        name: "Kochi",
        stateId: "kerala",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    isActive: false,
    cities: [
      {
        id: "chandigarh",
        name: "Chandigarh",
        stateId: "chandigarh",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    isActive: false,
    cities: [
      {
        id: "jaipur",
        name: "Jaipur",
        stateId: "rajasthan",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "uttar-pradesh",
    name: "Uttar Pradesh",
    isActive: false,
    cities: [
      {
        id: "lucknow",
        name: "Lucknow",
        stateId: "uttar-pradesh",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "madhya-pradesh",
    name: "Madhya Pradesh",
    isActive: false,
    cities: [
      {
        id: "indore",
        name: "Indore",
        stateId: "madhya-pradesh",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    isActive: false,
    cities: [
      {
        id: "visakhapatnam",
        name: "Visakhapatnam",
        stateId: "andhra-pradesh",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "odisha",
    name: "Odisha",
    isActive: false,
    cities: [
      {
        id: "bhubaneswar",
        name: "Bhubaneswar",
        stateId: "odisha",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
  {
    id: "bihar",
    name: "Bihar",
    isActive: false,
    cities: [
      {
        id: "patna",
        name: "Patna",
        stateId: "bihar",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
];

export const ACTIVE_STATE = LOCATIONS_DATA.find((s) => s.isActive) || LOCATIONS_DATA[0];
export const ACTIVE_CITY = ACTIVE_STATE.cities.find((c) => c.isActive) || ACTIVE_STATE.cities[0];
