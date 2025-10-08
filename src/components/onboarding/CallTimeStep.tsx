import React, { useState } from 'react';
import { Sunrise, Sun, Moon } from 'lucide-react';
import { OnboardingData } from '../Onboarding';

interface CallTimeStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CallTimeStep: React.FC<CallTimeStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [selectedTime, setSelectedTime] = useState(data.callTime);

  const timeOptions = [
    {
      id: 'morning',
      label: 'Morning',
      time: '8AM - 12PM',
      icon: Sunrise,
    },
    {
      id: 'afternoon',
      label: 'Afternoon',
      time: '12PM - 5PM',
      icon: Sun,
    },
    {
      id: 'evening',
      label: 'Evening',
      time: '5PM - 9PM',
      icon: Moon,
    },
  ];

  const handleSubmit = () => {
    if (selectedTime) {
      updateData({ callTime: selectedTime });
      onNext();
    }
  };

  const isLovedOne = data.registrationType === 'loved-one';

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        {isLovedOne ? 'When should Aasha call your loved one?' : 'When should Aasha call you?'}
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {timeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedTime === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedTime(option.id)}
              className={`p-8 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-[#F35E4A] bg-white shadow-lg'
                  : 'border-gray-300 bg-white hover:border-[#F35E4A]'
              }`}
            >
              <div className="flex flex-col items-center">
                <Icon
                  className={`h-12 w-12 mb-4 ${
                    isSelected ? 'text-[#F35E4A]' : 'text-gray-700'
                  }`}
                />
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    isSelected ? 'text-[#F35E4A]' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </h3>
                <p className="text-gray-600">{option.time}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setSelectedTime('custom')}
        className={`w-full p-6 rounded-2xl border-2 transition-all text-center ${
          selectedTime === 'custom'
            ? 'border-[#F35E4A] bg-white shadow-lg text-[#F35E4A]'
            : 'border-gray-300 bg-white hover:border-[#F35E4A] text-gray-900'
        }`}
      >
        <h3 className="text-xl font-bold">Custom Time Range</h3>
      </button>

      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedTime}
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CallTimeStep;
