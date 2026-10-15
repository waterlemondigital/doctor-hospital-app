import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, UserRound, Stethoscope, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { HOSPITALS_DATA } from '../data/hospitals';
import { DOCTORS_DATA } from '../data/doctors';
import { SPECIALITIES_DATA } from '../data/specialities';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | 'hospitals' | 'doctors' | 'specialities'>('all');
  const navigate = useNavigate();

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setCategoryFilter('all');
    }
  }, [open]);

  const cleanQuery = query.toLowerCase().trim();

  // Filter hospitals
  const filteredHospitals = HOSPITALS_DATA.filter((h) => {
    if (categoryFilter !== 'all' && categoryFilter !== 'hospitals') return false;
    if (!cleanQuery) return true;
    return (
      h.name.toLowerCase().includes(cleanQuery) ||
      h.area.toLowerCase().includes(cleanQuery) ||
      h.services.some((s) => s.toLowerCase().includes(cleanQuery)) ||
      h.departments.some(
        (d) =>
          d.name.toLowerCase().includes(cleanQuery) ||
          d.slug.toLowerCase().includes(cleanQuery)
      )
    );
  });

  // Filter doctors
  const filteredDoctors = DOCTORS_DATA.filter((d) => {
    if (categoryFilter !== 'all' && categoryFilter !== 'doctors') return false;
    if (!cleanQuery) return true;
    return (
      d.name.toLowerCase().includes(cleanQuery) ||
      d.department.toLowerCase().includes(cleanQuery) ||
      d.departmentSlug.toLowerCase().includes(cleanQuery) ||
      d.speciality.toLowerCase().includes(cleanQuery) ||
      d.subSpeciality.toLowerCase().includes(cleanQuery) ||
      d.areasOfPractice.some((a) => a.toLowerCase().includes(cleanQuery))
    );
  });

  // Filter specialities
  const filteredSpecialities = SPECIALITIES_DATA.filter((s) => {
    if (categoryFilter !== 'all' && categoryFilter !== 'specialities') return false;
    if (!cleanQuery) return true;
    return (
      s.name.toLowerCase().includes(cleanQuery) ||
      s.description.toLowerCase().includes(cleanQuery)
    );
  });

  const hasAnyResults =
    filteredHospitals.length > 0 || filteredDoctors.length > 0 || filteredSpecialities.length > 0;

  const handleSelectHospital = (slug: string) => {
    onOpenChange(false);
    navigate(`/hospitals/${slug}`);
  };

  const handleSelectDoctor = (slug: string) => {
    onOpenChange(false);
    navigate(`/doctors/${slug}`);
  };

  const handleSelectSpeciality = (name: string) => {
    onOpenChange(false);
    navigate(`/doctors?speciality=${encodeURIComponent(name)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl p-0 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 bg-slate-50/50">
          <Search className="h-5 w-5 text-[#0077b6] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by hospital, doctor or speciality..."
            className="w-full bg-transparent text-base text-[#03045e] placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter categories tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-slate-100 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium mr-1 shrink-0">Filter:</span>
          {(['all', 'hospitals', 'doctors', 'specialities'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition-colors cursor-pointer shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#caf0f8] text-[#03045e]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {/* Hospitals Group */}
          {filteredHospitals.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Building2 className="h-3.5 w-3.5 text-[#0077b6]" />
                <span>Hospitals ({filteredHospitals.length})</span>
              </div>
              <div className="space-y-1">
                {filteredHospitals.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSelectHospital(h.slug)}
                    className="flex w-full items-center justify-between p-3 rounded-xl hover:bg-[#caf0f8]/30 transition-colors text-left group cursor-pointer border border-transparent hover:border-[#90e0ef]/60"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#03045e] group-hover:text-[#0077b6]">
                        {h.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {h.area}, {h.city} · {h.facilityTypeBadge}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#0077b6] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Doctors Group */}
          {filteredDoctors.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <UserRound className="h-3.5 w-3.5 text-[#0077b6]" />
                <span>Doctors ({filteredDoctors.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDoctors.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectDoctor(d.slug)}
                    className="flex w-full items-center justify-between p-3 rounded-xl hover:bg-[#caf0f8]/30 transition-colors text-left group cursor-pointer border border-transparent hover:border-[#90e0ef]/60"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#03045e] group-hover:text-[#0077b6]">
                        {d.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.title} · {d.speciality}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#0077b6] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specialities Group */}
          {filteredSpecialities.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Stethoscope className="h-3.5 w-3.5 text-[#0077b6]" />
                <span>Specialities ({filteredSpecialities.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredSpecialities.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSpeciality(s.name)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-[#90e0ef] hover:bg-[#caf0f8]/20 transition-all text-left group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#03045e] group-hover:text-[#0077b6]">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {s.description}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#0077b6]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasAnyResults && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <p className="text-sm font-semibold text-[#03045e]">
                No verified entries found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs max-w-sm mx-auto">
                Currently, directory coverage is focused strictly on verified facilities and doctors in Pune, Maharashtra. More areas are in verification.
              </p>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 text-center text-[11px] text-slate-500">
          Informational directory only · Does not substitute professional medical diagnosis
        </div>
      </DialogContent>
    </Dialog>
  );
}
