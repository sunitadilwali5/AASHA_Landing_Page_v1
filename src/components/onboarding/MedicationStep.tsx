import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { OnboardingData } from '../Onboarding';

interface MedicationStepProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Medication {
  name: string;
  dosage_quantity: number;
  times_of_day: string[];
}

const MedicationStep: React.FC<MedicationStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [medications, setMedications] = useState<Medication[]>(data.medications || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState<Medication>({
    name: '',
    dosage_quantity: 1,
    times_of_day: [],
  });

  const handleAddMedication = () => {
    if (newMed.name && newMed.times_of_day.length > 0) {
      setMedications([...medications, newMed]);
      setNewMed({ name: '', dosage_quantity: 1, times_of_day: [] });
      setShowAddForm(false);
    }
  };

  const toggleTimeOfDay = (time: string) => {
    setNewMed(prev => ({
      ...prev,
      times_of_day: prev.times_of_day.includes(time)
        ? prev.times_of_day.filter(t => t !== time)
        : [...prev.times_of_day, time]
    }));
  };

  const incrementDosage = () => {
    setNewMed(prev => ({ ...prev, dosage_quantity: prev.dosage_quantity + 1 }));
  };

  const decrementDosage = () => {
    setNewMed(prev => ({ ...prev, dosage_quantity: Math.max(1, prev.dosage_quantity - 1) }));
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    updateData({ medications });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Share your Medication Details
      </h2>
      <p className="text-gray-600 mb-8">
        Help Aasha remind you about medications at the right times.
      </p>

      <div className="min-h-[300px] border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-8 bg-white">
        {medications.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <Plus className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-6">No medications added yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#F35E4A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e54d37] transition-all"
            >
              Add First Medication
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{med.name}</h4>
                  <p className="text-sm text-gray-600">
                    {med.dosage_quantity} {med.dosage_quantity === 1 ? 'tablet' : 'tablets'} • {med.times_of_day.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMedication(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}

            {showAddForm && (
              <div className="p-6 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <input
                    type="text"
                    placeholder="Medication name"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F35E4A] text-lg"
                  />
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewMed({ name: '', dosage_quantity: 1, times_of_day: [] });
                    }}
                    className="ml-4 text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-gray-700 font-medium mb-3">Dosage quantity</label>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-6 py-4">
                      <button
                        onClick={decrementDosage}
                        className="text-gray-600 hover:text-gray-900 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                        type="button"
                      >
                        −
                      </button>
                      <span className="text-2xl font-semibold text-gray-900">{newMed.dosage_quantity}</span>
                      <button
                        onClick={incrementDosage}
                        className="text-gray-600 hover:text-gray-900 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-3">Times of Day</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                        <label
                          key={time}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newMed.times_of_day.includes(time)}
                            onChange={() => toggleTimeOfDay(time)}
                            className="w-5 h-5 text-[#F35E4A] border-gray-300 rounded focus:ring-[#F35E4A]"
                          />
                          <span className="text-gray-700">{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleAddMedication}
                    disabled={!newMed.name || newMed.times_of_day.length === 0}
                    className="w-full bg-[#F35E4A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e54d37] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Medication
                  </button>
                </div>
              </div>
            )}

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg font-semibold hover:border-[#F35E4A] hover:text-[#F35E4A] transition-all"
              >
                + Add Another Medication
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => {
              updateData({ medications: [] });
              onNext();
            }}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationStep;
