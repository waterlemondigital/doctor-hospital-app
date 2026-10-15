import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UserRound, Filter, AlertCircle, RefreshCw, X, Stethoscope, Building2 } from 'lucide-react';
import { DOCTORS_DATA } from '../data/doctors';
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

  const [query, setQuery] = React.useState(initialQuery);
  const [selectedSpeciality, setSelectedSpeciality] = React.useState(initialSpeciality);
  const [selectedHospital, setSelectedHospital] = React.useState(initialHospital);

  React.useEffect(() => {
    const s = searchParams.get('speciality');
    if (s) setSelectedSpeciality(s);
  }, [searchParams]);

  const cleanQuery = query.toLowerCase().trim();

  const filteredDoctors = DOCTORS_DATA.filter((d) => {
    // Speciality filter
    if (selectedSpeciality !== 'all' && d.speciality.toLowerCase() !== selectedSpeciality.toLowerCase()) {
      return false;
    }

    // Hospital filter
    if (
      selectedHospital !== 'all' &&
      !d.hospitals.some((h) => h.hospitalId === selectedHospital)
    ) {
      return false;
    }

    if (!cleanQuery) return true;

    return (
      d.name.toLowerCase().includes(cleanQuery) ||
      d.department.toLowerCase().includes(cleanQuery) ||
      d.departmentSlug.toLowerCase().includes(cleanQuery) ||
      d.speciality.toLowerCase().includes(cleanQuery) ||
      d.subSpeciality.toLowerCase().includes(cleanQuery) ||
      d.areasOfPractice.some((a) => a.toLowerCase().includes(cleanQuery)) ||
      d.summary.toLowerCase().includes(cleanQuery)
    );
  });

  const resetFilters = () => {
    setQuery('');
    setSelectedSpeciality('all');
    setSelectedHospital('all');
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Header & Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
          <UserRound className="h-4 w-4" />
          <span>Verified Medical Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#03045e] tracking-tight">
          Consulting Doctors in Pune
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Factual credentials, verified hospital consulting schedules, and direct hospital booking desks. HealthDiscover never ranks or endorses doctors.
        </p>
      </div>

      {/* Redesigned Clean & Spacious Filter Bar */}
      <div className="rounded-3xl border border-[#90e0ef] bg-white p-5 sm:p-6 shadow-sm space-y-4">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0077b6] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor name, clinical speciality, or sub-speciality focus..."
            className="w-full h-13 pl-12 pr-12 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-sm font-medium text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:bg-white transition-all shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-[#03045e] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Structured Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Speciality Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Clinical Speciality
            </label>
            <Select
              value={selectedSpeciality}
              onChange={(e) => setSelectedSpeciality(e.target.value)}
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

          {/* Hospital Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Consulting Hospital
            </label>
            <Select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              icon={<Building2 className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter consulting hospital"
            >
              <option value="all">All Hospitals</option>
              {HOSPITALS_DATA.map((hosp) => (
                <option key={hosp.id} value={hosp.id}>
                  {hosp.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Quick Filter Pills & Result Counter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Quick Speciality:</span>
            <button
              type="button"
              onClick={() => setSelectedSpeciality('all')}
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
              onClick={() => setSelectedSpeciality('Cardiology')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedSpeciality === 'Cardiology'
                  ? 'bg-[#caf0f8] text-[#03045e] shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cardiology
            </button>
            <button
              type="button"
              onClick={() => setSelectedSpeciality('General Medicine')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedSpeciality === 'General Medicine'
                  ? 'bg-[#caf0f8] text-[#03045e] shadow-2xs'
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
            {(query || selectedSpeciality !== 'all' || selectedHospital !== 'all') && (
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
              We are actively verifying additional consultants across cardiology, general medicine, and allied branches in Pune. Profiles are published only after statutory council confirmation.
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
