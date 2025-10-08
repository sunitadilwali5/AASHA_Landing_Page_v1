import React from 'react';
import { Settings } from 'lucide-react';
import SettingsSection from '../dashboard/SettingsSection';

interface FamilySettingsSectionProps {
  elderlyProfile: any;
}

const FamilySettingsSection: React.FC<FamilySettingsSectionProps> = ({ elderlyProfile }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center mb-6">
          <Settings className="h-8 w-8 text-[#F35E4A] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Settings
          </h2>
        </div>
        <p className="text-gray-600">Manage your account and notification preferences.</p>
      </div>

      <SettingsSection elderlyProfile={elderlyProfile} />
    </div>
  );
};

export default FamilySettingsSection;
