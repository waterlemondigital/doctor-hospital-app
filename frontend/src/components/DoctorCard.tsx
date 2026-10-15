import * as React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Doctor } from '../types';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';

interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
  showHospitalList?: boolean;
}

export function DoctorCard({ doctor, className, showHospitalList = true }: DoctorCardProps) {
  const primaryAffiliation = doctor.hospitals[0];

  return (
    <Card className={`overflow-hidden group hover:shadow-md transition-all duration-200 border-[#90e0ef]/70 flex flex-col justify-between ${className || ''}`}>
      <CardContent className="p-5 space-y-4">
        {/* Top Header: Avatar + Speciality & Department */}
        <div className="flex items-start gap-3.5">
          <Avatar className="h-14 w-14 border border-[#90e0ef] shrink-0">
            <AvatarImage src={doctor.photo} alt={doctor.name} />
            <AvatarFallback>
              {doctor.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Link
              to={`/doctors/${doctor.slug}`}
              className="block group-hover:text-[#0077b6] transition-colors"
            >
              <h3 className="text-base font-bold text-[#03045e] leading-snug">
                {doctor.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-xs font-semibold text-[#0077b6]">
                {doctor.speciality}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                {doctor.departmentSlug}
              </span>
              {doctor.city && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-[#caf0f8]/60 border border-[#90e0ef]/60 px-1.5 py-0.5 rounded-md">
                  <MapPin className="h-3 w-3 text-[#0077b6]" />
                  {doctor.city}{doctor.area ? ` · ${doctor.area}` : ''}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {doctor.qualifications}
            </p>
          </div>
        </div>

        {/* Professional Overview taken directly from Doctor profile */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {doctor.summary}
        </p>

        {/* Consulting Affiliations directly from Doctor profile page */}
        {showHospitalList && primaryAffiliation && (
          <div className="rounded-xl bg-[#caf0f8]/30 border border-[#90e0ef]/50 p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-[#03045e] font-semibold">
              <Building2 className="h-3.5 w-3.5 text-[#0077b6] shrink-0" />
              <span className="truncate">{primaryAffiliation.hospitalName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
              <span>{primaryAffiliation.days} · {primaryAffiliation.timings}</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Card Action Footer */}
      <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
        {doctor.experienceYears ? (
          <span className="text-xs font-semibold text-slate-500">
            {doctor.experienceYears}+ yrs experience
          </span>
        ) : (
          <span />
        )}

        <Button asChild size="sm" variant="default" className="gap-1.5 bg-[#0077b6] hover:bg-[#03045e]">
          <Link to={`/doctors/${doctor.slug}`}>
            <span>View Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
