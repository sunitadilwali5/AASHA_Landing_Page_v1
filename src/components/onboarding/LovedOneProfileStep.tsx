import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';

interface LovedOneProfileStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LovedOneProfileStep: React.FC<LovedOneProfileStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    lovedOneFirstName: data.lovedOneFirstName || '',
    lovedOneLastName: data.lovedOneLastName || '',
    lovedOneDateOfBirth: data.lovedOneDateOfBirth || '',
    lovedOneGender: data.lovedOneGender || '',
    lovedOneLanguage: data.lovedOneLanguage || 'English',
    lovedOneMaritalStatus: data.lovedOneMaritalStatus || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (
      formData.lovedOneFirstName &&
      formData.lovedOneLastName &&
      formData.lovedOneDateOfBirth &&
      formData.lovedOneGender &&
      formData.lovedOneLanguage &&
      formData.lovedOneMaritalStatus
    ) {
      updateData(formData);
      onNext();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        Tell us about your loved one
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">First name</label>
          <input
            type="text"
            value={formData.lovedOneFirstName}
            onChange={(e) => handleChange('lovedOneFirstName', e.target.value)}
            placeholder="First name"
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A]"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Last name</label>
          <input
            type="text"
            value={formData.lovedOneLastName}
            onChange={(e) => handleChange('lovedOneLastName', e.target.value)}
            placeholder="Last name"
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A]"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Date of birth</label>
          <input
            type="date"
            value={formData.lovedOneDateOfBirth}
            onChange={(e) => handleChange('lovedOneDateOfBirth', e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A]"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Gender</label>
          <select
            value={formData.lovedOneGender}
            onChange={(e) => handleChange('lovedOneGender', e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Language</label>
          <select
            value={formData.lovedOneLanguage}
            onChange={(e) => handleChange('lovedOneLanguage', e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="Mandarin">Mandarin</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Marital status</label>
          <select
            value={formData.lovedOneMaritalStatus}
            onChange={(e) => handleChange('lovedOneMaritalStatus', e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white"
          >
            <option value="">Select</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Divorced">Divorced</option>
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
          disabled={
            !formData.lovedOneFirstName ||
            !formData.lovedOneLastName ||
            !formData.lovedOneDateOfBirth ||
            !formData.lovedOneGender ||
            !formData.lovedOneMaritalStatus
          }
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LovedOneProfileStep;
