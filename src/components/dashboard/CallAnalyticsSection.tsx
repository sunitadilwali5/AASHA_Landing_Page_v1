import React, { useState, useEffect } from 'react';
import { BarChart3, Phone, Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { getCallAnalytics, getMedicineAdherence } from '../../services/retellService';

interface CallAnalyticsSectionProps {
  elderlyProfile: {
    id: string;
  };
}

const CallAnalyticsSection: React.FC<CallAnalyticsSectionProps> = ({ elderlyProfile }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [medicineData, setMedicineData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [elderlyProfile.id, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [callData, medicineAdherence] = await Promise.all([
        getCallAnalytics(elderlyProfile.id, timeRange),
        getMedicineAdherence(elderlyProfile.id, timeRange),
      ]);
      setAnalytics(callData);
      setMedicineData(medicineAdherence);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F35E4A]"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Call Analytics</h2>
            <p className="text-gray-600">Review your call history and statistics</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#F35E4A] focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.totalCalls}</h3>
          <p className="text-gray-600 text-sm">Total Calls</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{analytics.successfulCalls}</h3>
          <p className="text-gray-600 text-sm">Successful Calls</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {Math.floor(analytics.avgDuration / 60)}:{(analytics.avgDuration % 60).toString().padStart(2, '0')}
          </h3>
          <p className="text-gray-600 text-sm">Avg Duration</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${analytics.totalCost}</h3>
          <p className="text-gray-600 text-sm">Total Cost</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-6 w-6 text-[#F35E4A] mr-2" />
            Call Status Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Successful</span>
                <span className="font-semibold text-green-600">{analytics.successfulCalls}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${analytics.totalCalls > 0 ? (analytics.successfulCalls / analytics.totalCalls) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Voicemail</span>
                <span className="font-semibold text-yellow-600">{analytics.voicemailCalls}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{
                    width: `${analytics.totalCalls > 0 ? (analytics.voicemailCalls / analytics.totalCalls) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Failed</span>
                <span className="font-semibold text-red-600">{analytics.failedCalls}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full"
                  style={{
                    width: `${analytics.totalCalls > 0 ? (analytics.failedCalls / analytics.totalCalls) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 text-[#F35E4A] mr-2" />
            User Sentiment
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Positive</span>
                <span className="font-semibold text-green-600">{analytics.sentimentCounts.Positive}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${analytics.totalCalls > 0 ? (analytics.sentimentCounts.Positive / analytics.totalCalls) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Neutral</span>
                <span className="font-semibold text-gray-600">{analytics.sentimentCounts.Neutral}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-500 h-3 rounded-full"
                  style={{
                    width: `${analytics.totalCalls > 0 ? (analytics.sentimentCounts.Neutral / analytics.totalCalls) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Negative</span>
                <span className="font-semibold text-red-600">{analytics.sentimentCounts.Negative}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full"
                  style={{
                    width: `${analytics.totalCalls > 0 ? (analytics.sentimentCounts.Negative / analytics.totalCalls) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {medicineData && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-6 w-6 text-[#F35E4A] mr-2" />
            Medicine Adherence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-900">{medicineData.adherenceRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Adherence Rate</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{medicineData.takenDays}</p>
              <p className="text-sm text-gray-600 mt-1">Days Taken</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{medicineData.missedDays}</p>
              <p className="text-sm text-gray-600 mt-1">Days Missed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{medicineData.totalDays}</p>
              <p className="text-sm text-gray-600 mt-1">Total Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallAnalyticsSection;
