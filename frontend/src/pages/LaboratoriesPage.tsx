import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FlaskConical, MapPin, Globe, AlertCircle, RefreshCw, X, ShieldCheck, Home, CheckCircle2 } from 'lucide-react';
import { Hospital } from '../types';
import { fetchLaboratories } from '../api/laboratories';
import { LOCATIONS_DATA, ACTIVE_STATE, ACTIVE_CITY } from '../data/locations';
import { LaboratoryCard } from '../components/LaboratoryCard';
import { Button } from '../components/ui/button';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export function LaboratoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';
  const initialAccreditation = searchParams.get('accreditation') || 'all';
  const initialCollection = searchParams.get('collection') || 'all';
  const initialCategory = searchParams.get('category') || 'all';

  const [laboratories, setLaboratories] = React.useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    fetchLaboratories()
      .then((data) => {
        if (isMounted) {
          if (data) setLaboratories(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const [query, setQuery] = React.useState(initialQuery);
  const [selectedAccreditation, setSelectedAccreditation] = React.useState(initialAccreditation);
  const [selectedCollection, setSelectedCollection] = React.useState(initialCollection);
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory);

  const [selectedCountry, setSelectedCountry] = React.useState('india');
  const [selectedState, setSelectedState] = React.useState(ACTIVE_STATE.id);
  const [selectedCity, setSelectedCity] = React.useState(ACTIVE_CITY.id);

  const currentState = LOCATIONS_DATA.find((s) => s.id === selectedState) || ACTIVE_STATE;

  // Sync state when URL params change
  React.useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) setQuery(s);
    const acc = searchParams.get('accreditation');
    if (acc) setSelectedAccreditation(acc);
    const col = searchParams.get('collection');
    if (col) setSelectedCollection(col);
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const updateSearchParam = (key: string, val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val && val !== 'all') {
        next.set(key, val);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    updateSearchParam('search', val);
  };

  const cleanQuery = query.toLowerCase().trim();

  // Filter laboratories based on search, location, accreditation, home collection, and category
  const filteredLabs = laboratories.filter((lab) => {
    // 1. Location Filters
    if (selectedState && lab.state.toLowerCase() !== currentState.name.toLowerCase()) {
      return false;
    }
    if (selectedCity && lab.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }

    // 2. Accreditation Filter
    if (selectedAccreditation !== 'all') {
      const accText = (lab.accreditation || '').toLowerCase();
      if (selectedAccreditation === 'nabl' && !accText.includes('nabl')) {
        return false;
      }
      if (selectedAccreditation === 'hospital' && !lab.name.toLowerCase().includes('hospital')) {
        return false;
      }
    }

    // 3. Home Sample Collection Filter
    if (selectedCollection !== 'all') {
      const hasCollection =
        lab.homeSampleCollection ??
        (lab.overview.toLowerCase().includes('home sample collection') ||
          lab.services.some((s) => s.toLowerCase().includes('home collection')));

      if (selectedCollection === 'home' && !hasCollection) {
        return false;
      }
    }

    // 4. Test Category Filter
    if (selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase();
      const matchesCategory =
        lab.services.some((s) => s.toLowerCase().includes(catLower)) ||
        lab.departments.some((d) => d.name.toLowerCase().includes(catLower) || d.slug.includes(catLower));
      if (!matchesCategory) {
        return false;
      }
    }

    // 5. Query Search
    if (!cleanQuery) return true;

    return (
      lab.name.toLowerCase().includes(cleanQuery) ||
      lab.area.toLowerCase().includes(cleanQuery) ||
      lab.address.toLowerCase().includes(cleanQuery) ||
      lab.services.some((s) => s.toLowerCase().includes(cleanQuery)) ||
      lab.departments.some(
        (d) =>
          d.name.toLowerCase().includes(cleanQuery) ||
          d.slug.toLowerCase().includes(cleanQuery)
      )
    );
  });

  const resetFilters = () => {
    setQuery('');
    setSelectedAccreditation('all');
    setSelectedCollection('all');
    setSelectedCategory('all');
    setSelectedCountry('india');
    setSelectedState(ACTIVE_STATE.id);
    setSelectedCity(ACTIVE_CITY.id);
    setSearchParams({});
  };

  const isFiltered =
    Boolean(query) ||
    selectedAccreditation !== 'all' ||
    selectedCollection !== 'all' ||
    selectedCategory !== 'all' ||
    selectedCity !== ACTIVE_CITY.id;

  const testCategories = [
    { id: 'all', label: 'All Tests' },
    { id: 'pathology', label: 'Routine Pathology' },
    { id: 'preventive', label: 'Preventive Health Packages' },
    { id: 'biochemistry', label: 'Clinical Biochemistry' },
    { id: 'haematology', label: 'Haematology' },
    { id: 'histopathology', label: 'Histopathology & Biopsy' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Title */}
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0077b6]">
          <FlaskConical className="h-4 w-4" />
          <span>Diagnostic Pathology Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#03045e] tracking-tight">
          Find Laboratories & Diagnostic Centers
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          NABL-accredited pathology reference laboratories, automated blood testing centers, and home sample collection facilities in Pune. Factual accreditation dates, verified test categories, and direct lab contacts.
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
            placeholder="Search by lab name, test (e.g. Thyroid, Lipid, CBC, Biopsy), or area..."
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-sm font-medium text-[#03045e] placeholder:text-slate-400 focus:outline-none focus:border-[#0077b6] focus:ring-2 focus:ring-[#90e0ef] transition-colors shadow-2xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                updateSearchParam('search', '');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-[#03045e] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Structured Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Accreditation Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Accreditation
            </label>
            <Select
              value={selectedAccreditation}
              onChange={(e) => {
                setSelectedAccreditation(e.target.value);
                updateSearchParam('accreditation', e.target.value);
              }}
              icon={<ShieldCheck className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter by accreditation"
            >
              <option value="all">All Standards</option>
              <option value="nabl">NABL / CAP Accredited</option>
              <option value="hospital">Hospital Pathology Wing</option>
            </Select>
          </div>

          {/* Home Sample Collection Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Home Sample Phlebotomy
            </label>
            <Select
              value={selectedCollection}
              onChange={(e) => {
                setSelectedCollection(e.target.value);
                updateSearchParam('collection', e.target.value);
              }}
              icon={<Home className="h-3.5 w-3.5 text-[#0077b6]" />}
              aria-label="Filter by home collection"
            >
              <option value="all">All Collection Types</option>
              <option value="home">Home Phlebotomy Available</option>
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

        {/* Quick Category Chips */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
            Popular Tests:
          </span>
          {testCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                updateSearchParam('category', cat.id);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0077b6] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-[#caf0f8]/60 hover:text-[#03045e]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Count and Active Filter Chips */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong>{filteredLabs.length}</strong> {filteredLabs.length === 1 ? 'verified diagnostic lab' : 'verified diagnostic labs'} in Pune
          </span>
          {isFiltered && (
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

      {/* Cards Grid using dedicated LaboratoryCard */}
      {filteredLabs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => (
            <LaboratoryCard key={lab.id} laboratory={lab} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#03045e]">
              No verified laboratories match your search
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We list NABL-certified pathology and molecular diagnostics laboratories with direct quality audits. Try resetting filters or searching for routine tests.
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
