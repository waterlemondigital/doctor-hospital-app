import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UserRound, RefreshCw, X, Stethoscope, Building2, MapPin, AlertCircle } from 'lucide-react';
import { DOCTORS_DATA, DOCTOR_CITIES } from '../data/doctors';
import { HOSPITALS_DATA } from '../data/hospitals';
import { SPECIALITIES_DATA } from '../data/specialities';
import { DoctorCard } from '../components/DoctorCard';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';

export function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const initialSpeciality = searchParams.get('speciality') || 'all';
  const initialHospital = searchParams.get('hospital') || 'all';
  const initialCity = searchParams.get('city') || searchParams.get('location') || 'all';

  const [query, setQuery] = React.useState(initialQuery);
  const [selectedCity, setSelectedCity] = React.useState(initialCity);
  const [selectedSpeciality, setSelectedSpeciality] = React.useState(initialSpeciality);
  const [selectedHospital, setSelectedHospital] = React.useState(initialHospital);

  // Sync state when URL params change
  React.useEffect(() => {
    const s = searchParams.get('speciality');
    if (s) setSelectedSpeciality(s);
    const c = searchParams.get('city') || searchParams.get('location');
    if (c) setSelectedCity(c);
    const h = searchParams.get('hospital');
    if (h) setSelectedHospital(h);
  }, [searchParams]);

  // Relational linkage: Hospitals available in the selected city
  const availableHospitals = React.useMemo(() => {
    if (selectedCity === 'all') {
      return HOSPITALS_DATA;
    }
    return HOSPITALS_DATA.filter(
      (hosp) => hosp.city.toLowerCase() === selectedCity.toLowerCase()
    );
  }, [selectedCity]);

  // If the currently selected hospital is not in the filtered city, reset it
  React.useEffect(() => {
    if (selectedHospital !== 'all') {
      const hospitalExistsInCity = availableHospitals.some((h) => h.id === selectedHospital);
      if (!hospitalExistsInCity) {
        setSelectedHospital('all');
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete('hospital');
          return next;
        });
      }
    }
  }, [selectedCity, availableHospitals, selectedHospital, setSearchParams]);

  const cleanQuery = query.toLowerCase().trim();

  // Relational Doctor Filtering: City + Speciality + Hospital
  const filteredDoctors = DOCTORS_DATA.filter((d) => {
    // 1. City Filter
    if (selectedCity !== 'all') {
      const cityLower = selectedCity.toLowerCase();
      const matchesDoctorCity = d.city?.toLowerCase() === cityLower;
      const matchesHospitalCity = d.hospitals.some((h) => {
        const hosp = HOSPITALS_DATA.find((item) => item.id === h.hospitalId);
        return hosp && hosp.city.toLowerCase() === cityLower;
      });
      if (!matchesDoctorCity && !matchesHospitalCity) {
        return false;
      }
    }

    // 2. Speciality Filter
    if (selectedSpeciality !== 'all') {
      if (d.speciality.toLowerCase() !== selectedSpeciality.toLowerCase()) {
        return false;
      }
    }

    // 3. Hospital Filter
    if (selectedHospital !== 'all') {
      if (!d.hospitals.some((h) => h.hospitalId === selectedHospital)) {
        return false;
      }
    }

    // 4. Free text Search
    if (!cleanQuery) return true;

    return (
      d.name.toLowerCase().includes(cleanQuery) ||
      d.department.toLowerCase().includes(cleanQuery) ||
      d.departmentSlug.toLowerCase().includes(cleanQuery) ||
      d.speciality.toLowerCase().includes(cleanQuery) ||
      d.subSpeciality.toLowerCase().includes(cleanQuery) ||
      (d.city && d.city.toLowerCase().includes(cleanQuery)) ||
      (d.area && d.area.toLowerCase().includes(cleanQuery)) ||
      d.hospitals.some((h) => (h.hospitalName && h.hospitalName.toLowerCase().includes(cleanQuery))) ||
      d.areasOfPractice.some((a) => a.toLowerCase().includes(cleanQuery)) ||
      d.summary.toLowerCase().includes(cleanQuery)
    );
  });

  const resetFilters = () => {
    setQuery('');
    setSelectedCity('all');
    setSelectedSpeciality('all');
    setSelectedHospital('all');
    setSearchParams({});
  };

  const updateCityFilter = (cityId: string) => {
    setSelectedCity(cityId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cityId !== 'all') {
        next.set('city', cityId);
      } else {
        next.delete('city');
      }
      next.delete('location'); // clear legacy location param if any
      return next;
    });
  };

  const updateSpecialityFilter = (spec: string) => {
    setSelectedSpeciality(spec);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (spec !== 'all') {
        next.set('speciality', spec);
      } else {
        next.delete('speciality');
      }
      return next;
    });
  };

  const updateHospitalFilter = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (hospitalId !== 'all') {
        next.set('hospital', hospitalId);
      } else {
        next.delete('hospital');
      }
      return next;
    });
  };

  const currentCityName =
    selectedCity === 'all'
      ? null
      : DOCTOR_CITIES.find((c) => c.id.toLowerCase() === selectedCity.toLowerCase())?.name || selectedCity;

  return (
    <div className="space-y-8">
      {/* Header & Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
          <UserRound className="h-4 w-4" />
          <span>Verified Medical Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#03045e] tracking-tight">
          Consulting Doctors {currentCityName ? `in ${currentCityName}` : ''}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Factual credentials, verified hospital consulting schedules, and direct hospital booking desks. Filter doctors by city, clinical speciality, and consulting hospital.
        </p>
      </div>

      {/* Redesigned Relational Filter Bar: Cities, Speciality, and Hospital */}
      <div className="rounded-3xl border border-[#90e0ef] bg-white p-5 sm:p-6 shadow-sm space-y-4">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0077b6] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor name, speciality, hospital, or city..."
            className="w-full h-13 pl-12 pr-12 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-medium text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:bg-white transition-all shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete('search');
                  return next;
                });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-[#03045e] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Structured Relational Filter Row: Cities, Speciality, Hospital */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* 1. Cities Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              City
            </label>
            <Select
              value={selectedCity}
              onChange={(e) => updateCityFilter(e.target.value)}
              icon={<MapPin className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter by city"
            >
              <option value="all">All Cities</option>
              {DOCTOR_CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>

          {/* 2. Speciality Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Clinical Speciality
            </label>
            <Select
              value={selectedSpeciality}
              onChange={(e) => updateSpecialityFilter(e.target.value)}
              icon={<Stethoscope className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter speciality"
            >
              <option value="all">All Specialities</option>
              {SPECIALITIES_DATA.map((spec) => (
                <option key={spec.id} value={spec.name}>
                  {spec.name}
                </option>
              ))}
            </Select>
          </div>

          {/* 3. Hospital Filter (Relational to City) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Consulting Hospital {currentCityName ? `(${currentCityName})` : ''}
            </label>
            <Select
              value={selectedHospital}
              onChange={(e) => updateHospitalFilter(e.target.value)}
              icon={<Building2 className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter consulting hospital"
            >
              <option value="all">
                {currentCityName ? `All Hospitals in ${currentCityName}` : 'All Hospitals'}
              </option>
              {availableHospitals.map((hosp) => (
                <option key={hosp.id} value={hosp.id}>
                  {hosp.name} {selectedCity === 'all' ? `(${hosp.city})` : ''}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Quick Filter Pills & Result Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Cities:</span>
            <button
              type="button"
              onClick={() => updateCityFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedCity === 'all'
                  ? 'bg-[#caf0f8] text-[#03045e] shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Cities
            </button>
            {DOCTOR_CITIES.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => updateCityFilter(city.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCity.toLowerCase() === city.id.toLowerCase()
                    ? 'bg-[#0077b6] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city.name}
              </button>
            ))}

            <span className="text-slate-300 mx-1">|</span>

            <span className="text-slate-400 font-medium">Speciality:</span>
            <button
              type="button"
              onClick={() => updateSpecialityFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedSpeciality === 'all'
                  ? 'bg-[#caf0f8] text-[#03045e] shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Specialities
            </button>
            <button
              type="button"
              onClick={() => updateSpecialityFilter('Cardiology')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedSpeciality === 'Cardiology'
                  ? 'bg-[#0077b6] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cardiology
            </button>
            <button
              type="button"
              onClick={() => updateSpecialityFilter('General Medicine')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedSpeciality === 'General Medicine'
                  ? 'bg-[#0077b6] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              General Medicine
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Showing <strong>{filteredDoctors.length}</strong> {filteredDoctors.length === 1 ? 'specialist' : 'specialists'}
            </span>
            {(query || selectedSpeciality !== 'all' || selectedHospital !== 'all' || selectedCity !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-bold text-[#0077b6] hover:underline cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#03045e]">
              No verified doctors match your criteria
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We are actively verifying additional consultants across cities and hospital networks. Profiles are published only after statutory council confirmation.
            </p>
          </div>
          <Button onClick={resetFilters} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Clear Search & Filters</span>
          </Button>
        </div>
      )}
    </div>
  );
}
