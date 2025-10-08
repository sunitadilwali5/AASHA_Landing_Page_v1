import React, { useState } from 'react';
import {
  BookOpen,
  Music,
  Utensils,
  Plane,
  Camera,
  Palette,
  Sprout,
  Newspaper,
  Heart,
  Sparkles,
  Film,
  Trophy,
} from 'lucide-react';
import { OnboardingData } from '../Onboarding';

interface InterestsStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const InterestsStep: React.FC<InterestsStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.interests || []);

  const interests = [
    { id: 'reading', label: 'Reading', icon: BookOpen },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'cooking', label: 'Cooking', icon: Utensils },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'art-crafts', label: 'Art & Crafts', icon: Palette },
    { id: 'gardening', label: 'Gardening', icon: Sprout },
    { id: 'news', label: 'News & Current Affairs', icon: Newspaper },
    { id: 'health', label: 'Health & Wellness', icon: Heart },
    { id: 'devotional', label: 'Devotional', icon: Sparkles },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'sports', label: 'Sports', icon: Trophy },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    updateData({ interests: selectedInterests });
    onNext();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        What interests you?
      </h2>
      <p className="text-gray-600 mb-8">
        Select topics you enjoy discussing with Aasha.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {interests.map((interest) => {
          const Icon = interest.icon;
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`p-6 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-[#F35E4A] bg-[#F35E4A] text-white shadow-lg'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-[#F35E4A]'
              }`}
            >
              <div className="flex flex-col items-center">
                <Icon className="h-8 w-8 mb-3" />
                <span className="text-center font-semibold">{interest.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedInterests.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Selected interests:</h3>
          <div className="flex flex-wrap gap-3">
            {selectedInterests.map((id) => {
              const interest = interests.find((i) => i.id === id);
              return (
                <span
                  key={id}
                  className="px-4 py-2 bg-[#F35E4A] text-white rounded-full text-sm font-semibold"
                >
                  {interest?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedInterests.length === 0}
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default InterestsStep;
