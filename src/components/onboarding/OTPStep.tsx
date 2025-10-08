import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';

interface OTPStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OTPStep: React.FC<OTPStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [otp, setOtp] = useState(data.otp);

  const handleSubmit = () => {
    if (otp.length === 6) {
      updateData({ otp });
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
          <div className="px-4 py-4 border-2 border-gray-300 rounded-lg text-lg bg-gray-100 w-32 flex items-center">
            <span className="text-gray-700">{data.countryCode}</span>
          </div>
          <input
            type="tel"
            value={data.phoneNumber}
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

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms-otp"
            defaultChecked
            className="mt-1 h-5 w-5 text-[#F35E4A] border-gray-300 rounded focus:ring-[#F35E4A]"
          />
          <label htmlFor="terms-otp" className="text-gray-700">
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
          disabled={otp.length !== 6}
          className="w-full bg-[#F35E4A] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify & Continue
        </button>
      </div>
    </div>
  );
};

export default OTPStep;
