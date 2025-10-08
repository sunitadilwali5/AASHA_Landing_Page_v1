import React, { useState, useEffect } from 'react';
import { Pill, Plus, Edit2, Trash2, Check, X, Clock, Calendar } from 'lucide-react';
import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  trackMedicationTaken,
  getMedicationTracking,
} from '../../services/dashboardService';

interface MedicationsSectionProps {
  elderlyProfile: {
    id: string;
  };
}

const MedicationsSection: React.FC<MedicationsSectionProps> = ({ elderlyProfile }) => {
  const [medications, setMedications] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    time: '09:00',
  });

  useEffect(() => {
    loadMedications();
  }, [elderlyProfile.id]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await getMedications(elderlyProfile.id);
      setMedications(data);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMedication({
        elderly_profile_id: elderlyProfile.id,
        ...formData,
      });
      await loadMedications();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Failed to add medication');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;
    try {
      await updateMedication(selectedMed.id, formData);
      await loadMedications();
      setShowEditModal(false);
      setSelectedMed(null);
      resetForm();
    } catch (error) {
      console.error('Error updating medication:', error);
      alert('Failed to update medication');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;
    try {
      await deleteMedication(id);
      await loadMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Failed to delete medication');
    }
  };

  const handleTrack = async (med: any, status: 'taken' | 'skipped') => {
    try {
      const now = new Date();
      const scheduledDatetime = new Date();
      const [hours, minutes] = med.time.split(':');
      scheduledDatetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await trackMedicationTaken(med.id, scheduledDatetime.toISOString(), status);
      alert(`Medication marked as ${status}`);
    } catch (error) {
      console.error('Error tracking medication:', error);
      alert('Failed to track medication');
    }
  };

  const openEditModal = (med: any) => {
    setSelectedMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      time: med.time,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      time: '09:00',
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedMed(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F35E4A]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Medications</h2>
          <p className="text-gray-600 mt-2">Manage your daily medications and track adherence</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-[#F35E4A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e54d37] transition-all shadow-md"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Medication
        </button>
      </div>

      {/* Medications List */}
      {medications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med) => (
            <div key={med.id} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:border-[#F35E4A] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="bg-[#F35E4A] bg-opacity-10 rounded-lg p-3 mr-3">
                    <Pill className="h-6 w-6 text-[#F35E4A]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{med.name}</h3>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(med)}
                    className="text-gray-500 hover:text-[#F35E4A] transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="h-4 w-4 mr-2 text-[#F35E4A]" />
                  <span>{med.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-2 text-[#F35E4A]" />
                  <span>{med.frequency}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleTrack(med, 'taken')}
                  className="flex-1 flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Taken
                </button>
                <button
                  onClick={() => handleTrack(med, 'skipped')}
                  className="flex-1 flex items-center justify-center border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  <X className="h-4 w-4 mr-1" />
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Pill className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Medications Yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first medication</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#F35E4A] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e54d37] transition-all"
          >
            Add Your First Medication
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {showAddModal ? 'Add New Medication' : 'Edit Medication'}
            </h3>
            <form onSubmit={showAddModal ? handleAdd : handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#F35E4A] focus:outline-none text-lg"
                  placeholder="e.g., Aspirin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#F35E4A] focus:outline-none text-lg"
                  placeholder="e.g., 50mg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#F35E4A] focus:outline-none text-lg"
                  required
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#F35E4A] focus:outline-none text-lg"
                  required
                />
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#F35E4A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e54d37] transition-all"
                >
                  {showAddModal ? 'Add Medication' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsSection;
