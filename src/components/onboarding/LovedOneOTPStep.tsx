import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';

interface LovedOneOTPStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LovedOneOTPStep: React.FC<LovedOneOTPStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [otp, setOtp] = useState(data.lovedOneOtp || '');

  const handleSubmit = () => {
    if (otp.length === 6) {
      updateData({ lovedOneOtp: otp });
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Verify your loved one's phone number
      </h2>
      <p className="text-gray-600 mb-8">
        Enter the verification code sent to their phone
      </p>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="px-4 py-4 border-2 border-gray-300 rounded-lg text-lg bg-gray-100 w-32 flex items-center">
            <span className="text-gray-700">{data.lovedOneCountryCode}</span>
          </div>
          <input
            type="tel"
            value={data.lovedOnePhoneNumber}
            disabled
            className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-lg bg-gray-100 text-gray-700"
          />
        </div>

        <input
          type="text"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(value);
          }}
          placeholder="123456"
          maxLength={6}
          className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-2xl text-center tracking-widest focus:outline-none focus:border-[#F35E4A]"
        />

        <button className="text-[#F35E4A] hover:underline font-medium">
          Resend OTP
        </button>
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
          disabled={otp.length !== 6}
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify & Continue
        </button>
      </div>
    </div>
  );
};

export default LovedOneOTPStep;
