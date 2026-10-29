import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Stethoscope,
  Building2,
  MapPin,
  ExternalLink,
  Edit3,
  Globe,
  Filter,
  CheckCircle2,
  RefreshCw,
  Loader2,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { TargetHospital, TargetLaboratory } from '../types';
import { fetchAllPublicDoctors } from '../api/client';
import { EditDoctorForm } from './EditDoctorForm';

interface EditDoctorSectionProps {
  hospitals?: TargetHospital[];
  laboratories?: TargetLaboratory[];
  onDataChanged?: () => void;
}

export function EditDoctorSection({
  hospitals = [],
  laboratories = [],
  onDataChanged,
}: EditDoctorSectionProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSpeciality, setSelectedSpeciality] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllPublicDoctors();
      if (Array.isArray(data)) {
        setDoctors(data);
      }
    } catch (err: any) {
      console.error('Failed to load doctors list:', err);
      toast.error('Failed to load doctors list: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  // Filter options
  const countries = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      const c = (d.country || (d.city === 'singapore' ? 'Singapore' : 'India')).trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [doctors]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.city) set.add(d.city.toLowerCase());
    });
    return Array.from(set).sort();
  }, [doctors]);

  const specialities = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.speciality) set.add(d.speciality);
    });
    return Array.from(set).sort();
  }, [doctors]);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const docCountry = (doc.country || (doc.city === 'singapore' ? 'Singapore' : 'India')).toLowerCase();
      const docCity = (doc.city || '').toLowerCase();
      const docSpec = (doc.speciality || '').toLowerCase();

      // Country filter
      if (selectedCountry !== 'all' && docCountry !== selectedCountry.toLowerCase()) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && docCity !== selectedCity.toLowerCase()) {
        return false;
      }

      // Speciality filter
      if (selectedSpeciality !== 'all' && docSpec !== selectedSpeciality.toLowerCase()) {
        return false;
      }

      // Search query
      if (q) {
        const matchesName = (doc.name || '').toLowerCase().includes(q);
        const matchesSpec = (doc.speciality || '').toLowerCase().includes(q);
        const matchesDept = (doc.department || '').toLowerCase().includes(q);
        const matchesCity = (doc.city || '').toLowerCase().includes(q);
        const matchesArea = (doc.area || '').toLowerCase().includes(q);
        const matchesId = (doc.id || '').toLowerCase().includes(q);
        return matchesName || matchesSpec || matchesDept || matchesCity || matchesArea || matchesId;
      }

      return true;
    });
  }, [doctors, searchQuery, selectedCountry, selectedCity, selectedSpeciality]);

  // If a doctor is selected, render the edit form
  if (selectedDoctorId) {
    return (
      <EditDoctorForm
        doctorId={selectedDoctorId}
        hospitals={hospitals}
        laboratories={laboratories}
        onDoctorUpdated={() => {
          loadDoctors();
          if (onDataChanged) onDataChanged();
        }}
        onBack={() => setSelectedDoctorId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-[#0077b6] border border-blue-100 shadow-2xs">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#03045e] tracking-tight">
                Doctor Directory Editor
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {doctors.length} Doctors in DB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select any doctor in the database to edit credentials, schedules, bio, and affiliations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadDoctors}
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
            placeholder="Search by doctor name, speciality, city, department, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Country */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            >
              <option value="all">All Countries ({doctors.length})</option>
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

          {/* Speciality */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Speciality</label>
            <select
              value={selectedSpeciality}
              onChange={(e) => setSelectedSpeciality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
            >
              <option value="all">All Specialities</option>
              {specialities.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-[#03045e]">{filteredDoctors.length}</strong> of{' '}
            {doctors.length} doctors
          </span>

          {(searchQuery || selectedCountry !== 'all' || selectedCity !== 'all' || selectedSpeciality !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('all');
                setSelectedCity('all');
                setSelectedSpeciality('all');
              }}
              className="text-[#0077b6] font-bold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0077b6] animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading doctors directory...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No doctors found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => {
            const countryLabel = doc.country || (doc.city === 'singapore' ? 'Singapore' : 'India');
            const hospCount = Array.isArray(doc.hospitals) ? doc.hospitals.length : 0;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  {/* Top Row: Country Badge & Edit Button */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {countryLabel} • {doc.city}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0077b6] hover:bg-[#03045e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {doc.photo ? (
                        <img
                          src={doc.photo}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Stethoscope className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Titles */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-[#03045e] truncate group-hover:text-[#0077b6] transition-colors">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {doc.title || 'Consultant Specialist'}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate max-w-full">
                        {doc.speciality}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Department:</span>
                      <span className="font-medium truncate max-w-[160px] text-right">
                        {doc.department || doc.speciality}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Experience:</span>
                      <span className="font-medium">
                        {doc.experience_years ? `${doc.experience_years} Years` : 'Not specified'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Hospital Schedule:</span>
                      <span className="font-semibold text-emerald-700">
                        {hospCount} Hospital{hospCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Link to live site */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                    ID: {doc.id}
                  </span>

                  <a
                    href={`http://localhost:3000/doctors/${doc.slug || doc.id}`}
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

