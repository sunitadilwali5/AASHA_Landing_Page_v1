import React from 'react';
import { Pill } from 'lucide-react';
import MedicationsSection from '../dashboard/MedicationsSection';

interface FamilyMedicationManagementProps {
  elderlyProfile: any;
}

const FamilyMedicationManagement: React.FC<FamilyMedicationManagementProps> = ({ elderlyProfile }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center mb-6">
          <Pill className="h-8 w-8 text-[#F35E4A] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Medication Management for {elderlyProfile.first_name}
          </h2>
        </div>
        <p className="text-gray-600">Track and manage medications to ensure proper adherence.</p>
      </div>

      <MedicationsSection elderlyProfile={elderlyProfile} />
    </div>
  );
};

export default FamilyMedicationManagement;
