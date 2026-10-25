import { query } from '../db/postgres.js';
import {
  Hospital,
  Doctor,
  Laboratory,
  WellnessCenter,
  City,
  Speciality,
  HospitalDoctorAffiliation,
  DoctorAffiliation,
} from '../types/index.js';

class DirectoryDataStore {
  public isLoaded: boolean = false;
  public lastLoadedAt: number = 0;
  public ttlSeconds: number = 300; // 5 minutes TTL

  public hospitals: Hospital[] = [];
  public hospitalsBySlug: Map<string, Hospital> = new Map();
  public hospitalsById: Map<string, Hospital> = new Map();

  public doctors: Doctor[] = [];
  public doctorsBySlug: Map<string, Doctor> = new Map();
  public doctorsById: Map<string, Doctor> = new Map();

  public laboratories: Laboratory[] = [];
  public laboratoriesBySlugOrId: Map<string, Laboratory> = new Map();

  public wellnessCenters: WellnessCenter[] = [];
  public wellnessBySlugOrId: Map<string, WellnessCenter> = new Map();

  public cities: City[] = [];
  public specialities: Speciality[] = [];

  private isReloading: boolean = false;

  private parseJson(val: any): any {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val || [];
  }

  public async reloadAll(): Promise<void> {
    if (this.isReloading) return;
    this.isReloading = true;
    const t0 = performance.now();

    try {
      // 1. Fetch raw hospitals, doctors, affiliations in parallel
      const [
        hospRes,
        docRes,
        affRes,
        labRes,
        wellRes,
        cityRes,
        specRes,
        hospLabAffRes,
        docLabAffRes,
      ] = await Promise.all([
        query(`SELECT * FROM hospitals ORDER BY name ASC`),
        query(`SELECT * FROM doctors ORDER BY name ASC`),
        query(`SELECT * FROM doctor_hospital_affiliations`),
        query(`SELECT * FROM laboratories ORDER BY name ASC`),
        query(`SELECT * FROM wellness_centers ORDER BY name ASC`),
        query(`SELECT * FROM cities ORDER BY is_active DESC, name ASC`),
        query(`SELECT * FROM specialities ORDER BY name ASC`),
        query(`SELECT * FROM hospital_laboratory_affiliations`),
        query(`SELECT * FROM doctor_laboratory_affiliations`),
      ]);

      // Map hospital-laboratory affiliations
      const hospitalsByLab = new Map<string, string[]>();
      for (const aff of hospLabAffRes.rows) {
        const list = hospitalsByLab.get(aff.laboratory_id) || [];
        list.push(aff.hospital_id);
        hospitalsByLab.set(aff.laboratory_id, list);
      }

      // Map doctor-laboratory affiliations
      const doctorsByLab = new Map<string, string[]>();
      const laboratoriesByDoctor = new Map<string, string[]>();
      for (const aff of docLabAffRes.rows) {
        const list = doctorsByLab.get(aff.laboratory_id) || [];
        list.push(aff.doctor_id);
        doctorsByLab.set(aff.laboratory_id, list);

        const labList = laboratoriesByDoctor.get(aff.doctor_id) || [];
        labList.push(aff.laboratory_id);
        laboratoriesByDoctor.set(aff.doctor_id, labList);
      }

      // Map raw doctors by id
      const rawDoctorsMap = new Map<string, any>();
      for (const d of docRes.rows) {
        rawDoctorsMap.set(d.id, d);
      }

      // Map raw hospitals by id
      const rawHospitalsMap = new Map<string, any>();
      for (const h of hospRes.rows) {
        rawHospitalsMap.set(h.id, h);
      }

      // Group affiliations by hospital_id and by doctor_id
      const affiliationsByHospital = new Map<string, HospitalDoctorAffiliation[]>();
      const affiliationsByDoctor = new Map<string, DoctorAffiliation[]>();

      for (const aff of affRes.rows) {
        const doc = rawDoctorsMap.get(aff.doctor_id);
        const hosp = rawHospitalsMap.get(aff.hospital_id);

        // For Hospital
        const hospAffList = affiliationsByHospital.get(aff.hospital_id) || [];
        hospAffList.push({
          doctor_id: aff.doctor_id,
          doctor_name: doc ? doc.name : null,
          doctor_slug: doc ? doc.slug : null,
          speciality: doc ? doc.speciality : null,
          days: aff.days,
          timings: aff.timings,
          note: aff.note || null,
        });
        affiliationsByHospital.set(aff.hospital_id, hospAffList);

        // For Doctor
        const docAffList = affiliationsByDoctor.get(aff.doctor_id) || [];
        docAffList.push({
          hospital_id: aff.hospital_id,
          hospital_name: hosp ? hosp.name : null,
          hospital_slug: hosp ? hosp.slug : null,
          hospital_city: hosp ? hosp.city : null,
          days: aff.days,
          timings: aff.timings,
          note: aff.note || null,
        });
        affiliationsByDoctor.set(aff.doctor_id, docAffList);
      }

      // Format Hospitals
      const formattedHospitals: Hospital[] = hospRes.rows.map((h: any) => ({
        id: h.id,
        slug: h.slug,
        name: h.name,
        state: h.state,
        city: h.city,
        area: h.area,
        address: h.address,
        pincode: h.pincode,
        facility_type: h.facility_type,
        facility_type_badge: h.facility_type_badge,
        overview: h.overview,
        bed_count: h.bed_count,
        emergency_available_24x7: !!h.emergency_available_24x7,
        website: h.website,
        phone: h.phone || '+91 78756 57402',
        whatsapp: h.whatsapp || '+91 78756 57402',
        maps_url: h.maps_url,
        verification_status: h.verification_status,
        last_checked: h.last_checked,
        images: this.parseJson(h.images),
        services: this.parseJson(h.services),
        departments: this.parseJson(h.departments),
        facilities: this.parseJson(h.facilities),
        sources: this.parseJson(h.sources),
        doctors: affiliationsByHospital.get(h.id) || [],
      }));

      // Format Doctors
      const formattedDoctors: Doctor[] = docRes.rows.map((d: any) => ({
        id: d.id,
        slug: d.slug,
        name: d.name,
        title: d.title,
        department: d.department,
        department_slug: d.department_slug,
        speciality: d.speciality,
        speciality_slug: d.speciality_slug,
        sub_speciality: d.sub_speciality,
        qualifications: d.qualifications,
        experience_years: d.experience_years,
        photo: d.photo,
        summary: d.summary,
        city: d.city,
        state: d.state,
        area: d.area,
        location: d.location,
        phone: d.phone || '+91 78756 57402',
        whatsapp: d.whatsapp || '+91 78756 57402',
        verification_status: d.verification_status,
        last_checked: d.last_checked,
        languages: this.parseJson(d.languages),
        areas_of_practice: this.parseJson(d.areas_of_practice),
        sources: this.parseJson(d.sources),
        hospitals: affiliationsByDoctor.get(d.id) || [],
        connected_laboratory_ids: laboratoriesByDoctor.get(d.id) || [],
      }));

      // Format Laboratories
      const formattedLabs: Laboratory[] = labRes.rows.map((l: any) => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        state: l.state,
        city: l.city,
        area: l.area,
        address: l.address,
        pincode: l.pincode,
        accreditation: l.accreditation,
        overview: l.overview,
        home_sample_collection: !!l.home_sample_collection,
        emergency_available_24x7: !!l.emergency_available_24x7,
        website: l.website,
        phone: l.phone,
        whatsapp: l.whatsapp,
        maps_url: l.maps_url,
        verification_status: l.verification_status,
        last_checked: l.last_checked,
        images: this.parseJson(l.images),
        services: this.parseJson(l.services),
        departments: this.parseJson(l.departments),
        facilities: this.parseJson(l.facilities),
        sources: this.parseJson(l.sources),
        connected_hospital_ids: hospitalsByLab.get(l.id) || [],
        connected_doctor_ids: doctorsByLab.get(l.id) || [],
      }));

      // Format Wellness Centers
      const formattedWellness: WellnessCenter[] = wellRes.rows.map((w: any) => ({
        id: w.id,
        slug: w.slug,
        name: w.name,
        category: w.category,
        state: w.state,
        city: w.city,
        area: w.area,
        address: w.address,
        pincode: w.pincode,
        accreditation: w.accreditation,
        overview: w.overview,
        website: w.website,
        phone: w.phone,
        whatsapp: w.whatsapp,
        maps_url: w.maps_url,
        verification_status: w.verification_status,
        last_checked: w.last_checked,
        images: this.parseJson(w.images),
        programs: this.parseJson(w.programs),
        disciplines: this.parseJson(w.disciplines),
        facilities: this.parseJson(w.facilities),
        sources: this.parseJson(w.sources),
      }));

      // Format Cities
      const formattedCities: City[] = cityRes.rows.map((c: any) => ({
        id: c.id,
        name: c.name,
        state_id: c.state_id,
        state_name: c.state_name || 'Maharashtra',
        is_active: !!c.is_active,
        hospital_count: c.hospital_count || 0,
      }));

      // Format Specialities
      const formattedSpecialities: Speciality[] = specRes.rows.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon_name: s.icon_name,
      }));

      // Update State atomically
      this.hospitals = formattedHospitals;
      this.hospitalsBySlug = new Map(formattedHospitals.map((h) => [h.slug, h]));
      this.hospitalsById = new Map(formattedHospitals.map((h) => [h.id, h]));

      this.doctors = formattedDoctors;
      this.doctorsBySlug = new Map(formattedDoctors.map((d) => [d.slug, d]));
      this.doctorsById = new Map(formattedDoctors.map((d) => [d.id, d]));

      this.laboratories = formattedLabs;
      this.laboratoriesBySlugOrId = new Map();
      for (const l of formattedLabs) {
        this.laboratoriesBySlugOrId.set(l.id, l);
        this.laboratoriesBySlugOrId.set(l.slug, l);
      }

      this.wellnessCenters = formattedWellness;
      this.wellnessBySlugOrId = new Map();
      for (const w of formattedWellness) {
        this.wellnessBySlugOrId.set(w.id, w);
        this.wellnessBySlugOrId.set(w.slug, w);
      }

      this.cities = formattedCities;
      this.specialities = formattedSpecialities;

      this.isLoaded = true;
      this.lastLoadedAt = Date.now();
      const elapsed = (performance.now() - t0).toFixed(1);
      console.log(
        `⚡ [DirectoryDataStore] Indexed from Neon: ${this.hospitals.length} hospitals, ${this.doctors.length} doctors, ${this.laboratories.length} labs, ${this.wellnessCenters.length} wellness, ${this.cities.length} cities in ${elapsed}ms.`
      );
    } catch (err) {
      console.error('[DirectoryDataStore] Error reloading data from Neon:', err);
    } finally {
      this.isReloading = false;
    }
  }

  public async ensureLoaded(force: boolean = false): Promise<void> {
    const isStale = Date.now() - this.lastLoadedAt > this.ttlSeconds * 1000;
    if (force || !this.isLoaded || isStale) {
      await this.reloadAll();
    }
  }

  // =========================================================================
  // In-Memory Fast Filtering & Search (<1ms)
  // =========================================================================

  public getHospitals(filters?: { city?: string; state?: string; search?: string }): Hospital[] {
    let results = this.hospitals;
    const { city, state, search } = filters || {};

    if (city && city !== 'all') {
      const cLow = city.toLowerCase().trim();
      results = results.filter((h) => h.city.toLowerCase().includes(cLow));
    }

    if (state && state !== 'all') {
      const sLow = state.toLowerCase().trim();
      results = results.filter((h) => h.state.toLowerCase().includes(sLow));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      results = results.filter((h) => {
        return (
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.area.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.facility_type.toLowerCase().includes(q) ||
          h.services.some((s) => typeof s === 'string' && s.toLowerCase().includes(q)) ||
          h.departments.some((d) => JSON.stringify(d).toLowerCase().includes(q))
        );
      });
    }

    return results;
  }

  public getHospitalBySlug(slug: string): Hospital | undefined {
    return this.hospitalsBySlug.get(slug) || this.hospitalsById.get(slug);
  }

  public getDoctors(filters?: {
    city?: string;
    speciality?: string;
    hospital_id?: string;
    search?: string;
  }): Doctor[] {
    let results = this.doctors;
    const { city, speciality, hospital_id, search } = filters || {};

    if (hospital_id && hospital_id !== 'all') {
      results = results.filter((d) => d.hospitals.some((aff) => aff.hospital_id === hospital_id));
    }

    if (city && city !== 'all') {
      const cLow = city.toLowerCase().trim();
      results = results.filter(
        (d) =>
          d.city.toLowerCase().includes(cLow) ||
          d.hospitals.some((aff) => aff.hospital_city && aff.hospital_city.toLowerCase().includes(cLow))
      );
    }

    if (speciality && speciality !== 'all') {
      const sLow = speciality.toLowerCase().trim();
      results = results.filter((d) => d.speciality.toLowerCase().includes(sLow));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q) ||
          d.speciality.toLowerCase().includes(q) ||
          (d.sub_speciality && d.sub_speciality.toLowerCase().includes(q)) ||
          d.city.toLowerCase().includes(q) ||
          (d.area && d.area.toLowerCase().includes(q)) ||
          (d.summary && d.summary.toLowerCase().includes(q))
      );
    }

    return results;
  }

  public getDoctorBySlug(slug: string): Doctor | undefined {
    return this.doctorsBySlug.get(slug) || this.doctorsById.get(slug);
  }

  public getLaboratories(filters?: { city?: string; search?: string }): Laboratory[] {
    let results = this.laboratories;
    const { city, search } = filters || {};

    if (city && city !== 'all') {
      const cLow = city.toLowerCase().trim();
      results = results.filter((l) => l.city.toLowerCase().includes(cLow));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          (l.accreditation && l.accreditation.toLowerCase().includes(q))
      );
    }

    return results;
  }

  public getLaboratoryBySlugOrId(slugOrId: string): Laboratory | undefined {
    return this.laboratoriesBySlugOrId.get(slugOrId);
  }

  public getWellnessCenters(filters?: { city?: string; category?: string; search?: string }): WellnessCenter[] {
    let results = this.wellnessCenters;
    const { city, category, search } = filters || {};

    if (city && city !== 'all') {
      const cLow = city.toLowerCase().trim();
      results = results.filter((w) => w.city.toLowerCase().includes(cLow));
    }

    if (category && category !== 'all') {
      const catLow = category.toLowerCase().trim();
      results = results.filter((w) => w.category.toLowerCase().includes(catLow));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.area.toLowerCase().includes(q) ||
          w.address.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          (Array.isArray(w.disciplines) && w.disciplines.some((d) => d.toLowerCase().includes(q)))
      );
    }

    return results;
  }

  public getWellnessBySlugOrId(slugOrId: string): WellnessCenter | undefined {
    return this.wellnessBySlugOrId.get(slugOrId);
  }

  public getCities(): City[] {
    return this.cities;
  }

  public getSpecialities(): Speciality[] {
    return this.specialities;
  }
}

export const directoryStore = new DirectoryDataStore();
