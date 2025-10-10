import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';

interface FamilyProfileStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FamilyProfileStep: React.FC<FamilyProfileStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: data.firstName,
    lastName: data.lastName,
    relationship: data.relationship || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.firstName && formData.lastName && formData.relationship) {
      updateData(formData);
      onNext();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Tell us about yourself
      </h2>
      <p className="text-gray-600 text-lg mb-8">
        We just need a few quick details to set up your account
      </p>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">First name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A]"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Last name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A]"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Relationship with your loved one
          </label>
          <select
            value={formData.relationship}
            onChange={(e) => handleChange('relationship', e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white"
          >
            <option value="">Select</option>
            <option value="Parent">Parent</option>
            <option value="Child">Child</option>
            <option value="Spouse">Spouse</option>
            <option value="Sibling">Sibling</option>
            <option value="Grandparent">Grandparent</option>
            <option value="Grandchild">Grandchild</option>
            <option value="Other Relative">Other Relative</option>
            <option value="Friend">Friend</option>
            <option value="Caregiver">Caregiver</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.firstName || !formData.lastName || !formData.relationship}
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default FamilyProfileStep;
