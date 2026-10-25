import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  FlaskConical,
  Sparkles,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { TargetDoctor, TargetHospital, TargetLaboratory, TargetWellness } from '../types';
import { AddHospitalForm } from './AddHospitalForm';
import { AddLaboratoryForm } from './AddLaboratoryForm';
import { AddDoctorForm } from './AddDoctorForm';
import { AddWellnessForm } from './AddWellnessForm';

interface AddEntitySectionProps {
  doctors: TargetDoctor[];
  hospitals: TargetHospital[];
  laboratories: TargetLaboratory[];
  wellness: TargetWellness[];
  onEntityCreated?: () => void;
}

type EntitySubTab = 'hospital' | 'doctor' | 'laboratory' | 'wellness';

export function AddEntitySection({
  doctors,
  hospitals,
  laboratories,
  wellness,
  onEntityCreated,
}: AddEntitySectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<EntitySubTab>('hospital');

  return (
    <div className="space-y-6">
      {/* Sub-navigation Pills for Entity Types */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {/* Hospital Option (Active) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('hospital')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'hospital'
                ? 'bg-[#0077b6] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#03045e] hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Add Hospital</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
              Active
            </span>
          </button>

          {/* Doctor Option (Active) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('doctor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'doctor'
                ? 'bg-[#0077b6] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#03045e] hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Add Doctor</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
              Active
            </span>
          </button>

          {/* Laboratory Option (Active) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('laboratory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'laboratory'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-[#03045e] hover:bg-slate-100'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Add Laboratory</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white">
              Active
            </span>
          </button>

          {/* Wellness Option (Active) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('wellness')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'wellness'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-[#03045e] hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Add Wellness Center</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
              Active
            </span>
          </button>
        </div>

        {/* Directory Counter Pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium pr-2">
          <span>Database Pool:</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
            {hospitals.length} Hospitals
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
            {doctors.length} Doctors
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
            {laboratories.length} Laboratories
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
            {wellness.length} Wellness
          </span>
        </div>
      </div>

      {/* Hospital Adding Form */}
      {activeSubTab === 'hospital' && (
        <AddHospitalForm
          doctors={doctors}
          laboratories={laboratories}
          onHospitalCreated={onEntityCreated}
        />
      )}

      {/* Doctor Adding Form */}
      {activeSubTab === 'doctor' && (
        <AddDoctorForm
          hospitals={hospitals}
          laboratories={laboratories}
          onDoctorCreated={onEntityCreated}
        />
      )}

      {/* Laboratory Adding Form */}
      {activeSubTab === 'laboratory' && (
        <AddLaboratoryForm
          hospitals={hospitals}
          doctors={doctors}
          onLaboratoryCreated={onEntityCreated}
        />
      )}

      {/* Wellness Adding Form */}
      {activeSubTab === 'wellness' && (
        <AddWellnessForm onWellnessCreated={onEntityCreated} />
      )}
    </div>
  );
}
