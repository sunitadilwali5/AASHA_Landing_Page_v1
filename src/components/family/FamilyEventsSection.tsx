import React from 'react';
import { Calendar } from 'lucide-react';
import SpecialEventsSection from '../dashboard/SpecialEventsSection';

interface FamilyEventsSectionProps {
  elderlyProfile: any;
}

const FamilyEventsSection: React.FC<FamilyEventsSectionProps> = ({ elderlyProfile }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center mb-6">
          <Calendar className="h-8 w-8 text-[#F35E4A] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Special Events for {elderlyProfile.first_name}
          </h2>
        </div>
        <p className="text-gray-600">Track important dates so Aasha can mention them in conversations.</p>
      </div>

      <SpecialEventsSection elderlyProfile={elderlyProfile} />
    </div>
  );
};

export default FamilyEventsSection;
