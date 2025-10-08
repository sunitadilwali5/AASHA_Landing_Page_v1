import React, { useEffect, useState } from 'react';
import { CheckCircle, Phone, Mail, Loader2 } from 'lucide-react';
import { OnboardingData } from '../Onboarding';
import { saveOnboardingData } from '../../services/onboardingService';

interface ThankYouStepProps {
  data: OnboardingData;
  onClose: () => void;
}

const ThankYouStep: React.FC<ThankYouStepProps> = ({ data, onClose }) => {
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saveData = async () => {
      try {
        setSaving(true);
        setError(null);
        await saveOnboardingData(data);
        setSaving(false);
      } catch (err: any) {
        console.error('Failed to save onboarding data:', err);
        const errorMessage = err?.message || 'Failed to save your information. Please try again.';
        setError(errorMessage);
        setSaving(false);
      }
    };

    saveData();
  }, []);

  if (saving) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="mb-8 flex justify-center">
          <Loader2 className="h-20 w-20 text-[#F35E4A] animate-spin" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Saving Your Information...
        </h2>
        <p className="text-xl text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="mb-8 flex justify-center">
          <div className="bg-red-500 rounded-full p-6">
            <CheckCircle className="h-20 w-20 text-white" />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Something Went Wrong
        </h2>
        <p className="text-xl text-red-600 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#F35E4A] text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <div className="mb-8 flex justify-center">
        <div className="bg-[#F35E4A] rounded-full p-6">
          <CheckCircle className="h-20 w-20 text-white" />
        </div>
      </div>

      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Thank You for Registering!
      </h2>
      <p className="text-xl text-gray-600 mb-12">
        Welcome to Aasha, {data.firstName}! We're excited to be your companion.
      </p>

      <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 mb-8 text-left">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">What happens next?</h3>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-[#F35E4A] rounded-full p-2 mt-1">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Aasha will call you soon
              </h4>
              <p className="text-gray-600">
                Based on your preference, you'll receive your first call during {data.callTime === 'morning' ? '8AM - 12PM' : data.callTime === 'afternoon' ? '12PM - 5PM' : '5PM - 9PM'}.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-[#F35E4A] rounded-full p-2 mt-1">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Check your email
              </h4>
              <p className="text-gray-600">
                We've sent you a confirmation email with details about your account and how to get started.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="bg-[#F35E4A] rounded-full p-2 mt-1">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Access your dashboard
              </h4>
              <p className="text-gray-600">
                Log in anytime to view conversation history, manage medications, and update your preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F35E4A]/10 rounded-2xl p-6 mb-8">
        <p className="text-gray-700">
          <strong>Need help getting started?</strong> Our support team is available 24/7 at{' '}
          <a href="mailto:hello@aasha.com" className="text-[#F35E4A] hover:underline">
            hello@aasha.com
          </a>{' '}
          or call{' '}
          <a href="tel:1-800-AASHA-1" className="text-[#F35E4A] hover:underline">
            1-800-AASHA-1
          </a>
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="bg-[#F35E4A] text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all shadow-lg"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default ThankYouStep;
