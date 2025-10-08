import React from 'react';
import { User, Phone, Calendar as CalendarIcon, Heart, Globe } from 'lucide-react';
import ProfileSection from '../dashboard/ProfileSection';

interface ElderlyProfileOverviewProps {
  elderlyProfile: any;
  onUpdate: () => void;
}

const ElderlyProfileOverview: React.FC<ElderlyProfileOverviewProps> = ({ elderlyProfile, onUpdate }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center mb-6">
          <User className="h-8 w-8 text-[#F35E4A] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            {elderlyProfile.first_name} {elderlyProfile.last_name}'s Profile
          </h2>
        </div>
        <p className="text-gray-600">View and manage your loved one's profile information.</p>
      </div>

      <ProfileSection elderlyProfile={elderlyProfile} onUpdate={onUpdate} />
    </div>
  );
};

export default ElderlyProfileOverview;
