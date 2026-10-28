import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Building2, MapPin, Globe, AlertCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import { Hospital } from '../types';
import { fetchHospitals } from '../api/hospitals';
import { HospitalCard } from '../components/HospitalCard';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';

export function HospitalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const cityParam = searchParams.get('city') || '';
  const stateParam = searchParams.get('state') || '';
  const countryParam = (searchParams.get('country') || '').toLowerCase();
  const specialityParam = searchParams.get('speciality') || '';

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
  const [selectedCountry, setSelectedCountry] = React.useState<string>(() => countryParam || 'india');
  const [selectedSpeciality, setSelectedSpeciality] = React.useState<string>(() => specialityParam || '');
  const [selectedState, setSelectedState] = React.useState<string>(() => stateParam || 'all');
  const [selectedCity, setSelectedCity] = React.useState<string>(() => cityParam || 'all');

  // 1. Dynamically extract all countries present in the database
  const availableCountries = React.useMemo(() => {
    const countryMap = new Map<string, { slug: string; name: string; flag: string; count: number }>();
    const flagMap: Record<string, { name: string; flag: string }> = {
      india: { name: 'India', flag: '🇮🇳' },
      singapore: { name: 'Singapore', flag: '🇸🇬' },
      turkey: { name: 'Turkey', flag: '🇹🇷' },
      thailand: { name: 'Thailand', flag: '🇹🇭' },
      germany: { name: 'Germany', flag: '🇩🇪' },
    };

    hospitals.forEach((h) => {
      const raw = ((h as any).country || 'india').trim().toLowerCase();
      const meta = flagMap[raw] || {
        name: raw.charAt(0).toUpperCase() + raw.slice(1),
        flag: '🌐',
      };
      const current = countryMap.get(raw) || {
        slug: raw,
        name: meta.name,
        flag: meta.flag,
        count: 0,
      };
      current.count += 1;
      countryMap.set(raw, current);
    });

    // If navigated from header with a country not yet populated, keep it visible in select
    if (selectedCountry && selectedCountry !== 'all' && !countryMap.has(selectedCountry.toLowerCase())) {
      const raw = selectedCountry.toLowerCase();
      const meta = flagMap[raw] || {
        name: raw.charAt(0).toUpperCase() + raw.slice(1),
        flag: '🌐',
      };
      countryMap.set(raw, {
        slug: raw,
        name: meta.name,
        flag: meta.flag,
        count: 0,
      });
    }

    return Array.from(countryMap.values()).sort((a, b) => b.count - a.count);
  }, [hospitals, selectedCountry]);

  // 2. Dynamically extract only states that exist in the database (filtered by country)
  const availableStates = React.useMemo(() => {
    const stateMap = new Map<string, { name: string; count: number }>();

    hospitals.forEach((h) => {
      if (selectedCountry && selectedCountry !== 'all') {
        const hCountry = ((h as any).country || 'india').toLowerCase();
        if (hCountry !== selectedCountry.toLowerCase()) return;
      }
      if (h.state && h.state.trim()) {
        const sName = h.state.trim();
        const key = sName.toLowerCase();
        const existing = stateMap.get(key) || { name: sName, count: 0 };
        existing.count += 1;
        stateMap.set(key, existing);
      }
    });

    return Array.from(stateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [hospitals, selectedCountry]);

  // 3. Dynamically extract only cities that exist in the database (filtered by country and selected state)
  const availableCities = React.useMemo(() => {
    const cityMap = new Map<string, { id: string; name: string; count: number }>();
    const formatCity = (name: string) => {
      return name
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    };

    hospitals.forEach((h) => {
      if (selectedCountry && selectedCountry !== 'all') {
        const hCountry = ((h as any).country || 'india').toLowerCase();
        if (hCountry !== selectedCountry.toLowerCase()) return;
      }
      if (selectedState && selectedState !== 'all') {
        if (h.state.toLowerCase() !== selectedState.toLowerCase()) return;
      }
      if (h.city && h.city.trim()) {
        const rawCity = h.city.trim();
        const key = rawCity.toLowerCase();
        const existing = cityMap.get(key) || {
          id: rawCity,
          name: formatCity(rawCity),
          count: 0,
        };
        existing.count += 1;
        cityMap.set(key, existing);
      }
    });

    return Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [hospitals, selectedCountry, selectedState]);

  // Sync state when URL search params change
  React.useEffect(() => {
    if (countryParam) {
      setSelectedCountry(countryParam);
    } else {
      setSelectedCountry('india');
    }

    if (specialityParam) {
      setSelectedSpeciality(specialityParam);
    } else {
      setSelectedSpeciality('');
    }

    if (stateParam) {
      setSelectedState(stateParam);
    } else {
      setSelectedState('all');
    }

    if (cityParam) {
      setSelectedCity(cityParam);
    } else {
      setSelectedCity('all');
    }

    if (initialQuery) {
      setQuery(initialQuery);
    } else {
      setQuery('');
    }
  }, [cityParam, stateParam, initialQuery, countryParam, specialityParam]);

  // Auto-validate state if it no longer exists in availableStates
  React.useEffect(() => {
    if (selectedState !== 'all' && availableStates.length > 0) {
      const exists = availableStates.some((s) => s.name.toLowerCase() === selectedState.toLowerCase());
      if (!exists) {
        setSelectedState('all');
      }
    }
  }, [availableStates, selectedState]);

  // Auto-validate city if it no longer exists in availableCities
  React.useEffect(() => {
    if (selectedCity !== 'all' && availableCities.length > 0) {
      const exists = availableCities.some(
        (c) => c.id.toLowerCase() === selectedCity.toLowerCase() || c.name.toLowerCase() === selectedCity.toLowerCase()
      );
      if (!exists) {
        setSelectedCity('all');
      }
    }
  }, [availableCities, selectedCity]);

  const handleCountryChange = (newCountry: string) => {
    const val = newCountry.toLowerCase();
    setSelectedCountry(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'india') {
      newParams.delete('country');
    } else {
      newParams.set('country', val);
      // Reset state and city when selecting another country
      setSelectedState('all');
      setSelectedCity('all');
      newParams.delete('state');
      newParams.delete('city');
    }
    setSearchParams(newParams);
  };

  const handleSpecialityChange = (newSpec: string) => {
    setSelectedSpeciality(newSpec);
    const newParams = new URLSearchParams(searchParams);
    if (newSpec) {
      newParams.set('speciality', newSpec);
    } else {
      newParams.delete('speciality');
    }
    setSearchParams(newParams);
  };

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

  const handleStateChange = (newStateName: string) => {
    setSelectedState(newStateName);
    const newParams = new URLSearchParams(searchParams);

    if (newStateName === 'all') {
      newParams.delete('state');
      setSelectedCity('all');
      newParams.delete('city');
    } else {
      newParams.set('state', newStateName);
      setSelectedCity('all');
      newParams.delete('city');
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
      // Auto-sync state from matched hospital in DB
      const match = hospitals.find((h) => h.city.toLowerCase() === newCityName.toLowerCase());
      if (match && match.state) {
        setSelectedState(match.state);
        newParams.set('state', match.state);
      }
    }
    setSearchParams(newParams);
  };

  const cleanQuery = query.toLowerCase().trim();

  // Filter hospitals based on search, country, speciality, and locations
  const filteredHospitals = hospitals.filter((h) => {
    // Country filter check
    if (selectedCountry && selectedCountry !== 'all') {
      const cLow = selectedCountry.toLowerCase();
      if (cLow === 'india') {
        const hCountry = ((h as any).country || '').toLowerCase();
        if (hCountry && hCountry !== 'india') return false;
      } else {
        const hCountry = ((h as any).country || '').toLowerCase();
        const hCity = (h.city || '').toLowerCase();
        const hState = (h.state || '').toLowerCase();
        const matchesCountry = hCountry === cLow || hCity.includes(cLow) || hState.includes(cLow);
        if (!matchesCountry) return false;
      }
    }

    // Speciality filter check
    if (selectedSpeciality) {
      const specLow = selectedSpeciality.toLowerCase();
      const hasDept = (h.departments || []).some(
        (d) => d.name.toLowerCase().includes(specLow) || d.slug.toLowerCase().includes(specLow)
      );
      const hasService = (h.services || []).some((s) => s.toLowerCase().includes(specLow));
      if (!hasDept && !hasService) return false;
    }

    // State filter check
    if (selectedState && selectedState !== 'all') {
      if ((h.state || '').toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
    }

    // City filter check
    if (selectedCity && selectedCity !== 'all') {
      if ((h.city || '').toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
    }

    if (!cleanQuery) return true;

    return (
      (h.name || '').toLowerCase().includes(cleanQuery) ||
      (h.area || '').toLowerCase().includes(cleanQuery) ||
      (h.address || '').toLowerCase().includes(cleanQuery) ||
      (h.services || []).some((s) => (s || '').toLowerCase().includes(cleanQuery)) ||
      (h.departments || []).some(
        (d) =>
          ((d && d.name) || '').toLowerCase().includes(cleanQuery) ||
          ((d && d.slug) || '').toLowerCase().includes(cleanQuery)
      )
    );
  });

  const resetFilters = () => {
    setQuery('');
    setSelectedCountry('india');
    setSelectedSpeciality('');
    setSelectedState('all');
    setSelectedCity('all');
    setSearchParams({});
  };

  const currentHeading = React.useMemo(() => {
    const countryNames: Record<string, string> = {
      india: 'India',
      singapore: 'Singapore',
      turkey: 'Turkey',
      thailand: 'Thailand',
      germany: 'Germany',
    };
    const cName = countryNames[selectedCountry] || (selectedCountry ? selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1) : 'India');

    if (selectedSpeciality) {
      return `${selectedSpeciality} Hospitals in ${cName}`;
    }
    if (selectedCity && selectedCity !== 'all') {
      const matchedCity = availableCities.find((c) => c.id.toLowerCase() === selectedCity.toLowerCase());
      const displayName = matchedCity ? matchedCity.name : selectedCity;
      return selectedState !== 'all' ? `Hospitals in ${displayName}, ${selectedState}` : `Hospitals in ${displayName}`;
    }
    if (selectedState && selectedState !== 'all') {
      return `Hospitals in ${selectedState}`;
    }
    return `Hospitals in ${cName}`;
  }, [selectedCountry, selectedSpeciality, selectedCity, selectedState, availableCities]);

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

        {/* Active Filter Pills (Country, Speciality, State, City) */}
        {(selectedCountry !== 'india' || selectedSpeciality || selectedState !== 'all' || selectedCity !== 'all') && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
            
            {/* Country Pill */}
            {selectedCountry !== 'india' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#caf0f8] px-3 py-1 text-xs font-bold text-[#03045e] border border-[#90e0ef]">
                <Globe className="h-3 w-3 text-[#0077b6]" />
                <span className="capitalize">{selectedCountry}</span>
                <button
                  type="button"
                  onClick={() => handleCountryChange('india')}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-[#90e0ef] text-slate-500 hover:text-[#03045e] transition-colors cursor-pointer"
                  title="Switch to India"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Speciality Pill */}
            {selectedSpeciality && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#caf0f8] px-3 py-1 text-xs font-bold text-[#03045e] border border-[#90e0ef]">
                <Sparkles className="h-3 w-3 text-[#0077b6]" />
                <span>Speciality: {selectedSpeciality}</span>
                <button
                  type="button"
                  onClick={() => handleSpecialityChange('')}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-[#90e0ef] text-slate-500 hover:text-[#03045e] transition-colors cursor-pointer"
                  title="Remove speciality filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* State Pill */}
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#caf0f8] px-3 py-1 text-xs font-bold text-[#03045e] border border-[#90e0ef]">
                <MapPin className="h-3 w-3 text-[#0077b6]" />
                <span>State: {selectedState}</span>
                <button
                  type="button"
                  onClick={() => handleStateChange('all')}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-[#90e0ef] text-slate-500 hover:text-[#03045e] transition-colors cursor-pointer"
                  title="Remove state filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* City Pill */}
            {selectedCity !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#caf0f8] px-3 py-1 text-xs font-bold text-[#03045e] border border-[#90e0ef]">
                <MapPin className="h-3 w-3 text-[#0077b6]" />
                <span className="capitalize">{selectedCity}</span>
                <button
                  type="button"
                  onClick={() => handleCityChange('all')}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-[#90e0ef] text-slate-500 hover:text-[#03045e] transition-colors cursor-pointer"
                  title="Remove city filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
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

        {/* Structured Filter Row: Country, State, and City (Rendered strictly from DB) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Country Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Country
            </label>
            <Select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              icon={<Globe className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter country"
            >
              {availableCountries.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
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
              <option value="all">All States</option>
              {availableStates.map((state) => (
                <option key={state.name} value={state.name}>
                  {state.name}
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
              {availableCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Reset filters when active */}
        {(query || selectedCountry !== 'india' || selectedSpeciality || selectedState !== 'all' || selectedCity !== 'all') && (
          <div className="flex items-center justify-end text-xs text-slate-500 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 font-bold text-[#0077b6] hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset filters</span>
            </button>
          </div>
        )}
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
      ) : selectedCountry !== 'india' ? (
        /* Empty State for international countries being populated */
        <div className="rounded-3xl border border-dashed border-[#90e0ef] bg-gradient-to-b from-[#caf0f8]/25 to-white p-10 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#caf0f8] text-[#0077b6] shadow-2xs">
            <Globe className="h-7 w-7" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-block rounded-full bg-[#0077b6] px-3 py-1 text-xs font-bold text-white shadow-2xs capitalize">
              {selectedCountry} Network Expansion
            </span>
            <h3 className="text-xl font-bold text-[#03045e] capitalize">
              Accredited Hospitals in {selectedCountry} Under Verification
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We are currently onboarding and independently auditing tertiary care institutions, super-speciality hospitals, and medical centers for <strong>{selectedCountry.toUpperCase()}</strong>. Verified hospital profiles and department directories will be published shortly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => handleCountryChange('india')}
              variant="default"
              size="sm"
              className="bg-[#0077b6] hover:bg-[#03045e] text-white font-bold"
            >
              <span>Explore India Verified Network (60+ Hospitals)</span>
            </Button>
            <Button onClick={resetFilters} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Browse All Facilities</span>
            </Button>
          </div>
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
              We currently cover verified facilities across major metro hubs in India. We only publish listings that have been independently audited against statutory registries.
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
