import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Building2, MapPin, Globe, AlertCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import { Hospital } from '../types';
import { fetchHospitals } from '../api/hospitals';
import { LOCATIONS_DATA } from '../data/locations';
import { FAMOUS_TREATMENT_CITIES } from '../data/treatmentCities';
import { HospitalCard } from '../components/HospitalCard';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';

export function HospitalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const cityParam = searchParams.get('city') || '';
  const stateParam = searchParams.get('state') || '';

  const [hospitals, setHospitals] = React.useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    fetchHospitals()
      .then((data) => {
        if (isMounted) {
          setHospitals(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch hospitals:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const [query, setQuery] = React.useState(initialQuery);
  const [selectedCountry, setSelectedCountry] = React.useState('india');
  const [selectedState, setSelectedState] = React.useState<string>(() => {
    if (stateParam) return stateParam;
    if (cityParam) {
      const match = FAMOUS_TREATMENT_CITIES.find(
        (c) => c.name.toLowerCase() === cityParam.toLowerCase() || c.id.toLowerCase() === cityParam.toLowerCase()
      );
      if (match) {
        const stateMatch = LOCATIONS_DATA.find((s) => s.name.toLowerCase() === match.state.toLowerCase());
        return stateMatch ? stateMatch.id : 'all';
      }
    }
    return 'all';
  });

  const [selectedCity, setSelectedCity] = React.useState<string>(() => {
    if (cityParam) {
      const match = FAMOUS_TREATMENT_CITIES.find(
        (c) => c.name.toLowerCase() === cityParam.toLowerCase() || c.id.toLowerCase() === cityParam.toLowerCase()
      );
      return match ? match.name : cityParam;
    }
    return 'all';
  });

  // Sync state when URL search params change
  React.useEffect(() => {
    if (cityParam) {
      const match = FAMOUS_TREATMENT_CITIES.find(
        (c) => c.name.toLowerCase() === cityParam.toLowerCase() || c.id.toLowerCase() === cityParam.toLowerCase()
      );
      const matchedCityName = match ? match.name : cityParam;
      setSelectedCity(matchedCityName);

      if (match) {
        const stateMatch = LOCATIONS_DATA.find((s) => s.name.toLowerCase() === match.state.toLowerCase());
        if (stateMatch) {
          setSelectedState(stateMatch.id);
        } else {
          setSelectedState('all');
        }
      }
    } else if (stateParam) {
      setSelectedState(stateParam);
    } else {
      setSelectedState('all');
      setSelectedCity('all');
    }
    if (initialQuery) {
      setQuery(initialQuery);
    } else {
      setQuery('');
    }
  }, [cityParam, stateParam, initialQuery]);

  const currentState = LOCATIONS_DATA.find((s) => s.id === selectedState);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleStateChange = (newStateId: string) => {
    setSelectedState(newStateId);
    const newParams = new URLSearchParams(searchParams);

    if (newStateId === 'all') {
      setSelectedCity('all');
      newParams.delete('state');
      newParams.delete('city');
    } else {
      newParams.set('state', newStateId);
      const st = LOCATIONS_DATA.find((s) => s.id === newStateId);
      if (st && st.cities.length > 0) {
        setSelectedCity(st.cities[0].name);
        newParams.set('city', st.cities[0].name);
      } else {
        setSelectedCity('all');
        newParams.delete('city');
      }
    }
    setSearchParams(newParams);
  };

  const handleCityChange = (newCityName: string) => {
    setSelectedCity(newCityName);
    const newParams = new URLSearchParams(searchParams);

    if (newCityName === 'all') {
      newParams.delete('city');
    } else {
      newParams.set('city', newCityName);
      // Auto-sync state if city belongs to a known state
      const match = FAMOUS_TREATMENT_CITIES.find(
        (c) => c.name.toLowerCase() === newCityName.toLowerCase()
      );
      if (match) {
        const st = LOCATIONS_DATA.find((s) => s.name.toLowerCase() === match.state.toLowerCase());
        if (st) {
          setSelectedState(st.id);
          newParams.set('state', st.id);
        }
      }
    }
    setSearchParams(newParams);
  };

  const cleanQuery = query.toLowerCase().trim();

  // Filter hospitals based on search and locations
  const filteredHospitals = hospitals.filter((h) => {
    // City filter check
    if (selectedCity && selectedCity !== 'all') {
      const normSelected = selectedCity.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normHCity = (h.city || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      let isCityMatch = normHCity.includes(normSelected) || normSelected.includes(normHCity);

      // Support common metro cluster regions
      if (!isCityMatch) {
        if (normSelected.includes('delhi') || normSelected.includes('ncr')) {
          isCityMatch = ['delhi', 'newdelhi', 'gurugram', 'faridabad', 'noida', 'ghaziabad'].some((c) => normHCity.includes(c));
        } else if (normSelected.includes('mumbai') || normSelected.includes('mmr')) {
          isCityMatch = ['mumbai', 'navimumbai', 'thane'].some((c) => normHCity.includes(c));
        } else if (normSelected.includes('kochi')) {
          isCityMatch = ['kochi', 'aluva', 'ernakulam'].some((c) => normHCity.includes(c));
        }
      }

      if (!isCityMatch) {
        return false;
      }
    } else if (selectedState && selectedState !== 'all' && currentState) {
      // Apply state filter when city is 'all'
      if (h.state.toLowerCase() !== currentState.name.toLowerCase()) {
        return false;
      }
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
    setSelectedState('all');
    setSelectedCity('all');
    setSearchParams({});
  };

  const currentHeading = React.useMemo(() => {
    if (selectedCity && selectedCity !== 'all') {
      const famous = FAMOUS_TREATMENT_CITIES.find(
        (c) => c.name.toLowerCase() === selectedCity.toLowerCase()
      );
      return famous ? `Hospitals in ${famous.name}, ${famous.state}` : `Hospitals in ${selectedCity}`;
    }
    if (currentState) {
      return `Hospitals in ${currentState.name}`;
    }
    return 'Hospitals in India';
  }, [selectedCity, currentState]);

  return (
    <div className="space-y-8">
      {/* Header & Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
          <Building2 className="h-4 w-4" />
          <span>Verified Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#03045e] tracking-tight">
          {currentHeading}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          Factual, verified healthcare facilities with operational departments, emergency availability, and direct official contacts. Sorted neutrally without commercial rankings.
        </p>

        {/* Active City Filter Pill if filtered */}
        {selectedCity && selectedCity !== 'all' && (
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active City:</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#caf0f8] px-3 py-1 text-xs font-bold text-[#03045e] border border-[#90e0ef]">
              <MapPin className="h-3 w-3 text-[#0077b6]" />
              <span>{selectedCity}</span>
              <button
                type="button"
                onClick={() => handleCityChange('all')}
                className="ml-0.5 rounded-full p-0.5 hover:bg-[#90e0ef] text-slate-500 hover:text-[#03045e] transition-colors cursor-pointer"
                title="Remove city filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar: Standard, Clean Proportions */}
      <div className="rounded-2xl border border-[#90e0ef] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Main Search Input */}
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by hospital name, department (e.g. Cardiology), or clinical service..."
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-medium text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef] transition-colors shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('search');
                setSearchParams(newParams);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-[#03045e] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Structured Filter Row: Country, State, and City */}
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
              State / Region
            </label>
            <Select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              icon={<MapPin className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter state"
            >
              <option value="all">All States (Pan-India)</option>
              {LOCATIONS_DATA.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name} {state.isActive ? '(Active)' : ''}
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
              onChange={(e) => handleCityChange(e.target.value)}
              icon={<MapPin className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter city"
            >
              <option value="all">All Cities</option>
              
              {/* If a state is selected and not 'all', show cities of that state */}
              {currentState && currentState.cities.length > 0 ? (
                <optgroup label={`${currentState.name} Cities`}>
                  {currentState.cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name} {city.hospitalCount > 0 ? `(${city.hospitalCount} Verified)` : ''}
                    </option>
                  ))}
                </optgroup>
              ) : null}

              {/* Also show all 20 Famous Treatment Cities for direct jumping */}
              <optgroup label="Famous Cities for Treatment">
                {FAMOUS_TREATMENT_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </optgroup>
            </Select>
          </div>
        </div>

        {/* Results summary and reset */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
          <span>
            Showing <strong>{filteredHospitals.length}</strong> verified {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'}
            {selectedCity !== 'all' ? ` in ${selectedCity}` : (currentState ? ` in ${currentState.name}` : '')}
          </span>
          {(query || selectedState !== 'all' || selectedCity !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-bold text-[#0077b6] hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Hospital Cards Grid or Loading */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#0077b6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading verified hospital network...</p>
        </div>
      ) : filteredHospitals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))}
        </div>
      ) : selectedCity && selectedCity !== 'all' && selectedCity.toLowerCase() !== 'pune' ? (
        /* Empty State for upcoming cities */
        <div className="rounded-3xl border border-dashed border-[#90e0ef] bg-gradient-to-b from-[#caf0f8]/25 to-white p-10 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#caf0f8] text-[#0077b6] shadow-2xs">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-block rounded-full bg-[#0077b6] px-3 py-1 text-xs font-bold text-white shadow-2xs">
              Listings Coming Soon
            </span>
            <h3 className="text-xl font-bold text-[#03045e]">
              Hospitals in {selectedCity} Under Verification
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We are currently onboarding and independently auditing tertiary care institutions, super-speciality hospitals, and medical centers for <strong>{selectedCity}</strong>. Verified listings will be published shortly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => handleCityChange('Pune')}
              variant="default"
              size="sm"
              className="bg-[#0077b6] hover:bg-[#03045e] text-white font-bold"
            >
              <span>Explore Pune Verified Hospitals</span>
            </Button>
            <Button onClick={resetFilters} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Browse All Facilities</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Standard Empty State */
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#03045e]">
              No verified hospitals match your search
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We currently cover verified facilities in Pune. We only publish listings that have been independently audited against statutory registries.
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
