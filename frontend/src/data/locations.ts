import { StateLocation } from '../types';

/**
 * Geographic coverage data.
 * Designed to easily extend to new states and cities by appending items.
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
        hospitalCount: 2,
      },
      {
        id: "mumbai",
        name: "Mumbai",
        stateId: "maharashtra",
        isActive: true,
        hospitalCount: 1,
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
    id: "delhi-ncr",
    name: "Delhi NCR",
    isActive: false,
    cities: [
      {
        id: "new-delhi",
        name: "New Delhi",
        stateId: "delhi-ncr",
        isActive: false,
        hospitalCount: 0,
      },
    ],
  },
];

export const ACTIVE_STATE = LOCATIONS_DATA.find((s) => s.isActive) || LOCATIONS_DATA[0];
export const ACTIVE_CITY = ACTIVE_STATE.cities.find((c) => c.isActive) || ACTIVE_STATE.cities[0];
