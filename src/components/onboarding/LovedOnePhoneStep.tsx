import React, { useState } from 'react';
import { OnboardingData } from '../Onboarding';
import { checkPhoneNumberExists } from '../../services/onboardingService';

interface LovedOnePhoneStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenLogin?: () => void;
}

const LovedOnePhoneStep: React.FC<LovedOnePhoneStepProps> = ({ data, updateData, onNext, onBack, onOpenLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState(data.lovedOnePhoneNumber || '');
  const [countryCode, setCountryCode] = useState(data.lovedOneCountryCode || '+1');
  const [useSameNumber, setUseSameNumber] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [showLoginOption, setShowLoginOption] = useState(false);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const validatePhoneNumber = (phone: string, code: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (code === '+1') {
      return digitsOnly.length === 10;
    } else if (code === '+91') {
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

    if (digitsOnly.length === 10 && validatePhoneNumber(digitsOnly, countryCode)) {
      const timeout = setTimeout(async () => {
        setChecking(true);
        try {
          const exists = await checkPhoneNumberExists(digitsOnly, countryCode);
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
    if (useSameNumber) {
      updateData({
        lovedOnePhoneNumber: data.phoneNumber,
        lovedOneCountryCode: data.countryCode,
      });
      onNext();
    } else {
      if (!phoneNumber) {
        setError('Phone number is required');
        return;
      }
      if (!validatePhoneNumber(phoneNumber, countryCode)) {
        if (countryCode === '+1') {
          setError('US phone number must be 10 digits');
        } else if (countryCode === '+91') {
          setError('Indian phone number must be 10 digits');
        }
        return;
      }

      if (showLoginOption) {
        return;
      }

      try {
        setChecking(true);
        setError('');

        const exists = await checkPhoneNumberExists(phoneNumber, countryCode);

        if (exists) {
          setError('This phone number is already registered. Please use a different number or contact support.');
          setShowLoginOption(true);
          setChecking(false);
          return;
        }

        updateData({
          lovedOnePhoneNumber: phoneNumber,
          lovedOneCountryCode: countryCode,
        });
        onNext();
      } catch (err) {
        console.error('Error checking phone number:', err);
        setError('Failed to verify phone number. Please try again.');
      } finally {
        setChecking(false);
      }
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
            onChange={(e) => {
              setCountryCode(e.target.value);
              setError('');
            }}
            disabled={useSameNumber}
            className="px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] bg-white w-32 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="+1">🇺🇸 +1</option>
            <option value="+91">🇮🇳 +91</option>
          </select>
          <input
            type="tel"
            value={useSameNumber ? data.phoneNumber : phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={countryCode === '+1' ? '2025551234' : '9876543210'}
            maxLength={10}
            disabled={useSameNumber}
            className={`flex-1 px-6 py-4 border-2 rounded-lg text-lg focus:outline-none focus:border-[#F35E4A] disabled:bg-gray-100 disabled:text-gray-500 ${
              error && !useSameNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            onClick={handleSubmit}
            disabled={(!useSameNumber && !phoneNumber) || checking}
            className="px-8 py-4 bg-gray-300 text-gray-600 rounded-lg text-lg font-semibold hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checking ? 'Checking...' : 'Send OTP'}
          </button>
        </div>

        {error && !useSameNumber && (
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
          disabled={(!useSameNumber && !phoneNumber) || checking}
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? 'Checking...' : 'Continue'}
        </button>
      </div>

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
  );
};

export default LovedOnePhoneStep;
