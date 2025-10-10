import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';
import { checkPhoneNumberExists } from '../../services/onboardingService';

interface PhoneStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onOpenLogin?: () => void;
}

const PhoneStep: React.FC<PhoneStepProps> = ({ data, updateData, onNext, onOpenLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [showLoginOption, setShowLoginOption] = useState(false);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (countryCode === '+1') {
      return digitsOnly.length === 10;
    } else if (countryCode === '+91') {
      return digitsOnly.length === 10;
    }
    return false;
  };

  const handlePhoneChange = async (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setPhoneNumber(digitsOnly);
    setError('');
    setShowLoginOption(false);

    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    if (digitsOnly.length === 10 && validatePhoneNumber(digitsOnly, data.countryCode)) {
      const timeout = setTimeout(async () => {
        setChecking(true);
        try {
          const exists = await checkPhoneNumberExists(digitsOnly, data.countryCode);
          if (exists) {
            setError('This phone number is already registered. Please use a different number or contact support.');
            setShowLoginOption(true);
          }
        } catch (err) {
          console.error('Error checking phone number:', err);
        } finally {
          setChecking(false);
        }
      }, 800);
      setCheckTimeout(timeout);
    }
  };

  const handleSubmit = async () => {
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }
    if (!validatePhoneNumber(phoneNumber, data.countryCode)) {
      if (data.countryCode === '+1') {
        setError('US phone number must be 10 digits');
      } else if (data.countryCode === '+91') {
        setError('Indian phone number must be 10 digits');
      }
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (showLoginOption) {
      return;
    }

    try {
      setChecking(true);
      setError('');

      const exists = await checkPhoneNumberExists(phoneNumber, data.countryCode);

      if (exists) {
        setError('This phone number is already registered. Please use a different number or contact support.');
        setShowLoginOption(true);
        setChecking(false);
        return;
      }

      updateData({ phoneNumber });
      onNext();
    } catch (err) {
      console.error('Error checking phone number:', err);
      setError('Failed to verify phone number. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleLoginClick = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      window.location.href = '/';
      setTimeout(() => {
        const loginButton = document.querySelector('[data-login-button]') as HTMLElement;
        if (loginButton) loginButton.click();
      }, 100);
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
            onChange={(e) => {
              updateData({ countryCode: e.target.value });
              setError('');
            }}
            className="px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white w-32"
          >
            <option value="+1">🇺🇸 +1</option>
            <option value="+91">🇮🇳 +91</option>
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={data.countryCode === '+1' ? '2025551234' : '9876543210'}
            maxLength={10}
            className={`flex-1 px-6 py-4 border-2 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-base">{error}</p>
            {showLoginOption && (
              <button
                onClick={handleLoginClick}
                type="button"
                className="mt-3 text-[#F35E4A] hover:underline font-semibold text-sm"
              >
                Click here to log in instead
              </button>
            )}
          </div>
        )}

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
          disabled={!phoneNumber || !agreed || checking}
          className="w-full bg-[#F35E4A] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {checking ? 'Checking...' : 'Send OTP'}
        </button>

        <div className="text-center mt-6">
          <button
            onClick={handleLoginClick}
            type="button"
            className="text-gray-600 hover:text-[#F35E4A] transition-colors text-sm"
          >
            Already Registered? <span className="font-semibold text-[#F35E4A]">Login here</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneStep;
