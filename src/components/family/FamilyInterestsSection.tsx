import React from 'react';
import { Heart } from 'lucide-react';
import InterestsSection from '../dashboard/InterestsSection';

interface FamilyInterestsSectionProps {
  elderlyProfile: any;
}

const FamilyInterestsSection: React.FC<FamilyInterestsSectionProps> = ({ elderlyProfile }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center mb-6">
          <Heart className="h-8 w-8 text-[#F35E4A] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            {elderlyProfile.first_name}'s Interests & Topics
          </h2>
        </div>
        <p className="text-gray-600">Manage conversation topics and interests for more engaging calls.</p>
      </div>

      <InterestsSection elderlyProfile={elderlyProfile} />
    </div>
  );
};

export default FamilyInterestsSection;
