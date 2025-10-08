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
  dosage: string;
  frequency: string;
  time: string;
}

const MedicationStep: React.FC<MedicationStepProps> = ({ data, updateData, onNext, onBack }) => {
  const [medications, setMedications] = useState<Medication[]>(data.medications || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    time: '',
  });

  const handleAddMedication = () => {
    if (newMed.name && newMed.dosage && newMed.frequency && newMed.time) {
      setMedications([...medications, newMed]);
      setNewMed({ name: '', dosage: '', frequency: '', time: '' });
      setShowAddForm(false);
    }
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
                    {med.dosage} • {med.frequency} • {med.time}
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
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-[#F35E4A]">
                <h4 className="font-semibold text-gray-900 mb-4">Add Medication</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Medication name"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F35E4A]"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g., 50mg)"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F35E4A]"
                  />
                  <select
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F35E4A]"
                  >
                    <option value="">Frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed</option>
                  </select>
                  <input
                    type="time"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F35E4A]"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleAddMedication}
                    className="flex-1 bg-[#F35E4A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#e54d37] transition-all"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewMed({ name: '', dosage: '', frequency: '', time: '' });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
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
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#F35E4A] text-white rounded-lg text-lg font-semibold hover:bg-[#e54d37] transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default MedicationStep;
