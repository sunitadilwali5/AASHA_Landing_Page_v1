import React from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationsSection from '../dashboard/ConversationsSection';

interface FamilyConversationsSectionProps {
  elderlyProfile: any;
}

const FamilyConversationsSection: React.FC<FamilyConversationsSectionProps> = ({ elderlyProfile }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center mb-6">
          <MessageCircle className="h-8 w-8 text-[#F35E4A] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Conversation History for {elderlyProfile.first_name}
          </h2>
        </div>
        <p className="text-gray-600">View summaries of Aasha's conversations with your loved one.</p>
      </div>

      <ConversationsSection elderlyProfile={elderlyProfile} />
    </div>
  );
};

export default FamilyConversationsSection;
