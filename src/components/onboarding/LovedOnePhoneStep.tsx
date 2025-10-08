import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';

interface LovedOnePhoneStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LovedOnePhoneStep: React.FC<LovedOnePhoneStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState(data.lovedOnePhoneNumber || '');
  const [countryCode, setCountryCode] = useState(data.lovedOneCountryCode || '+1');
  const [useSameNumber, setUseSameNumber] = useState(false);

  const handleSubmit = () => {
    if (useSameNumber) {
      updateData({
        lovedOnePhoneNumber: data.phoneNumber,
        lovedOneCountryCode: data.countryCode,
      });
      onNext();
    } else if (phoneNumber) {
      updateData({
        lovedOnePhoneNumber: phoneNumber,
        lovedOneCountryCode: countryCode,
      });
      onNext();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Where should Aasha call your loved one?
      </h2>
      <p className="text-gray-600 mb-8">
        Aasha will call them on this number
      </p>

      <div className="space-y-6">
        <div className="flex gap-4">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            disabled={useSameNumber}
            className="px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white w-32 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="+1">+1</option>
            <option value="+91">+91</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
          </select>
          <input
            type="tel"
            value={useSameNumber ? data.phoneNumber : phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            disabled={useSameNumber}
            className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!useSameNumber && !phoneNumber}
            className="px-8 py-4 bg-gray-300 text-gray-600 rounded-lg text-lg font-semibold hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send OTP
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="same-number"
            checked={useSameNumber}
            onChange={(e) => setUseSameNumber(e.target.checked)}
            className="h-5 w-5 text-[#F35E4A] border-gray-300 rounded focus:ring-[#F35E4A]"
          />
          <label htmlFor="same-number" className="text-gray-700">
            Same as signup phone number ({data.countryCode} {data.phoneNumber})
          </label>
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
          disabled={!useSameNumber && !phoneNumber}
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LovedOnePhoneStep;
