import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';

interface PhoneStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const PhoneStep: React.FC<PhoneStepProps> = ({ data, updateData, onNext }) => {
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (phoneNumber && agreed) {
      updateData({ phoneNumber });
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Enter your phone number
      </h2>
      <p className="text-gray-600 mb-8">
        We'll send you a verification code to ensure your account security.
      </p>

      <div className="space-y-6">
        <div className="flex gap-4">
          <select
            value={data.countryCode}
            onChange={(e) => updateData({ countryCode: e.target.value })}
            className="px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white w-32"
          >
            <option value="+1">+1</option>
            <option value="+91">+91</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="2345123451"
            className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A]"
          />
        </div>

        <div className="flex items-start space-x-3 mt-8">
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-5 w-5 text-[#F35E4A] border-gray-300 rounded focus:ring-[#F35E4A]"
          />
          <label htmlFor="terms" className="text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-[#F35E4A] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#F35E4A] hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!phoneNumber || !agreed}
          className="w-full bg-[#F35E4A] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
};

export default PhoneStep;
