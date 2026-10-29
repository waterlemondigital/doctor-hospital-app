import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Building2,
  MapPin,
  ExternalLink,
  Edit3,
  Globe,
  Filter,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Stethoscope,
  FlaskConical,
  Bed,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetDoctor, TargetLaboratory } from '../types';
import { fetchAllPublicHospitals } from '../api/client';
import { EditHospitalForm } from './EditHospitalForm';

interface EditHospitalSectionProps {
  doctors?: TargetDoctor[];
  laboratories?: TargetLaboratory[];
  onDataChanged?: () => void;
}

export function EditHospitalSection({
  doctors = [],
  laboratories = [],
  onDataChanged,
}: EditHospitalSectionProps) {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  const loadHospitals = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllPublicHospitals();
      if (Array.isArray(data)) {
        setHospitals(data);
      }
    } catch (err: any) {
      console.error('Failed to load hospitals list:', err);
      toast.error('Failed to load hospitals list: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  // Filter options
  const countries = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => {
      const c = (h.country || (h.city === 'singapore' ? 'Singapore' : 'India')).trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [hospitals]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => {
      if (h.city) set.add(h.city.toLowerCase());
    });
    return Array.from(set).sort();
  }, [hospitals]);

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hosp) => {
      const q = searchQuery.toLowerCase().trim();
      const hospCountry = (hosp.country || (hosp.city === 'singapore' ? 'Singapore' : 'India')).toLowerCase();
      const hospCity = (hosp.city || '').toLowerCase();

      // Country filter
      if (selectedCountry !== 'all' && hospCountry !== selectedCountry.toLowerCase()) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && hospCity !== selectedCity.toLowerCase()) {
        return false;
      }

      // Search query
      if (q) {
        const matchesName = (hosp.name || '').toLowerCase().includes(q);
        const matchesCity = (hosp.city || '').toLowerCase().includes(q);
        const matchesArea = (hosp.area || '').toLowerCase().includes(q);
        const matchesId = (hosp.id || '').toLowerCase().includes(q);
        const matchesType = (hosp.facility_type || '').toLowerCase().includes(q);
        return matchesName || matchesCity || matchesArea || matchesId || matchesType;
      }

      return true;
    });
  }, [hospitals, searchQuery, selectedCountry, selectedCity]);

  // If a hospital is selected, render the edit form
  if (selectedHospitalId) {
    return (
      <EditHospitalForm
        hospitalId={selectedHospitalId}
        doctors={doctors}
        laboratories={laboratories}
        onHospitalUpdated={() => {
          loadHospitals();
          if (onDataChanged) onDataChanged();
        }}
        onBack={() => setSelectedHospitalId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-[#0077b6] border border-blue-100 shadow-2xs">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#03045e] tracking-tight">
                Hospital Directory Editor
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {hospitals.length} Hospitals in DB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any hospital in the database to edit bed capacity, services, departments, and doctor affiliations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadHospitals}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0077b6]' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hospital name, city, area, facility type, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Country */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            >
              <option value="all">All Countries ({hospitals.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6] capitalize"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city} className="capitalize">
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-[#03045e]">{filteredHospitals.length}</strong> of{' '}
            {hospitals.length} hospitals
          </span>

          {(searchQuery || selectedCountry !== 'all' || selectedCity !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('all');
                setSelectedCity('all');
              }}
              className="text-[#0077b6] font-bold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0077b6] animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading hospitals directory...</p>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No hospitals found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHospitals.map((hosp) => {
            const countryLabel = hosp.country || (hosp.city === 'singapore' ? 'Singapore' : 'India');
            const docCount = Array.isArray(hosp.doctors) ? hosp.doctors.length : 0;
            const coverImg = hosp.images?.[0]?.url || hosp.images?.[0]?.card_url || '';

            return (
              <div
                key={hosp.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  {/* Top Row: Country Badge & Edit Button */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {countryLabel} • {hosp.city}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedHospitalId(hosp.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Hospital Info */}
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={hosp.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Titles */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-[#03045e] truncate group-hover:text-[#0077b6] transition-colors">
                        {hosp.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {hosp.area ? `${hosp.area}, ` : ''}{hosp.city}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 truncate max-w-full">
                        {hosp.facility_type_badge || hosp.facility_type}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Bed className="w-3 h-3 text-slate-400" /> Beds:
                      </span>
                      <span className="font-semibold">
                        {hosp.bed_count ? `${hosp.bed_count} Beds` : 'Not specified'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-[#0077b6]" /> Connected Doctors:
                      </span>
                      <span className="font-semibold text-blue-700">
                        {docCount} Specialist{docCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Emergency 24x7:</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          hosp.emergency_available_24x7
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {hosp.emergency_available_24x7 ? 'Available' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Link to live site */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                    ID: {hosp.id}
                  </span>

                  <a
                    href={`http://localhost:3000/hospitals/${hosp.slug || hosp.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0077b6] hover:text-[#03045e]"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

