import React from 'react';
import { Clock } from 'lucide-react';
import CallScheduleSection from '../dashboard/CallScheduleSection';

interface FamilyCallScheduleProps {
  elderlyProfile: any;
  onUpdate: () => void;
}

const FamilyCallSchedule: React.FC<FamilyCallScheduleProps> = ({ elderlyProfile, onUpdate }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center mb-6">
          <Clock className="h-8 w-8 text-[#F35E4A] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Call Schedule for {elderlyProfile.first_name}
          </h2>
        </div>
        <p className="text-gray-600">Manage when Aasha calls your loved one.</p>
      </div>

      <CallScheduleSection elderlyProfile={elderlyProfile} onUpdate={onUpdate} />
    </div>
  );
};

export default FamilyCallSchedule;
