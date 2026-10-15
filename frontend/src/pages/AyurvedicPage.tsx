import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Leaf, MapPin, Globe, AlertCircle, RefreshCw, X } from 'lucide-react';
import { AYURVEDIC_CENTERS_DATA } from '../data/ayurvedic';
import { LOCATIONS_DATA, ACTIVE_STATE, ACTIVE_CITY } from '../data/locations';
import { HospitalCard } from '../components/HospitalCard';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';

export function AyurvedicPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [query, setQuery] = React.useState(initialQuery);
  const [selectedCountry, setSelectedCountry] = React.useState('india');
  const [selectedState, setSelectedState] = React.useState(ACTIVE_STATE.id);
  const [selectedCity, setSelectedCity] = React.useState(ACTIVE_CITY.id);

  const currentState = LOCATIONS_DATA.find((s) => s.id === selectedState) || ACTIVE_STATE;

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const cleanQuery = query.toLowerCase().trim();

  const filteredCenters = AYURVEDIC_CENTERS_DATA.filter((h) => {
    if (selectedState && h.state.toLowerCase() !== currentState.name.toLowerCase()) {
      return false;
    }
    if (selectedCity && h.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (!cleanQuery) return true;

    return (
      h.name.toLowerCase().includes(cleanQuery) ||
      h.area.toLowerCase().includes(cleanQuery) ||
      h.address.toLowerCase().includes(cleanQuery) ||
      h.services.some((s) => s.toLowerCase().includes(cleanQuery)) ||
      h.departments.some(
        (d) =>
          d.name.toLowerCase().includes(cleanQuery) ||
          d.slug.toLowerCase().includes(cleanQuery)
      )
    );
  });

  const resetFilters = () => {
    setQuery('');
    setSelectedCountry('india');
    setSelectedState(ACTIVE_STATE.id);
    setSelectedCity(ACTIVE_CITY.id);
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Header & Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
          <Leaf className="h-4 w-4 text-emerald-600" />
          <span>AYUSH Directory · Ayurvedic Healthcare</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#03045e] tracking-tight">
          Ayurvedic Hospitals & Panchakarma Centers in Pune
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Verified Ayurvedic tertiary teaching hospitals, NABH-accredited Panchakarma suites, and Ksharasutra clinics in Pune, Maharashtra. Verified against statutory NCISM registers.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-[#90e0ef] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Main Search Input */}
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by hospital name, therapy (e.g. Panchakarma, Ksharasutra), or area..."
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-medium text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef] transition-colors shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchParams({});
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-[#03045e] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Structured Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Country Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Country
            </label>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              icon={<Globe className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter country"
            >
              <option value="india">India</option>
              <option value="more" disabled>More Countries (Coming Soon)</option>
            </Select>
          </div>

          {/* State Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              State
            </label>
            <Select
              value={selectedState}
              onChange={(e) => {
                const newStateId = e.target.value;
                setSelectedState(newStateId);
                const newState = LOCATIONS_DATA.find((s) => s.id === newStateId);
                if (newState && newState.cities.length > 0) {
                  setSelectedCity(newState.cities[0].id);
                }
              }}
              icon={<MapPin className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter state"
            >
              {LOCATIONS_DATA.map((state) => (
                <option key={state.id} value={state.id} disabled={!state.isActive}>
                  {state.name} {!state.isActive ? '(Coming Soon)' : ''}
                </option>
              ))}
            </Select>
          </div>

          {/* City Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              City
            </label>
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              icon={<MapPin className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter city"
            >
              {currentState.cities.map((city) => (
                <option key={city.id} value={city.id} disabled={!city.isActive}>
                  {city.name} {!city.isActive ? '(Coming Soon)' : ''}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Status Count and Active Filter Chips */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong>{filteredCenters.length}</strong> {filteredCenters.length === 1 ? 'verified Ayurvedic hospital' : 'verified Ayurvedic hospitals'}
          </span>
          {(query || selectedCountry !== 'india' || selectedState !== ACTIVE_STATE.id || selectedCity !== ACTIVE_CITY.id) && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-bold text-[#0077b6] hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {filteredCenters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <HospitalCard key={center.id} hospital={center} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#03045e]">
              No verified Ayurvedic facilities match your search
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We exclusively publish accredited Ayurvedic institutions with active statutory recognition.
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
