
import React from 'react';

interface PlanBadgeProps {
  isFeatured?: boolean;
  isProfessional?: boolean;
  isEditor?: boolean;
  isEditorPro?: boolean;
  badgeText?: string;
}

const PlanBadge = ({ isFeatured, isProfessional, isEditor, isEditorPro, badgeText }: PlanBadgeProps) => {
  if (isFeatured) {
    return (
      <div 
        className="absolute -top-3 right-2 z-20 px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white border-2 border-white shadow-lg"
      >
        {badgeText || 'Mais popular'}
      </div>
    );
  }
  
  if (isProfessional) {
    return (
      <div 
        className="absolute -top-3 right-2 z-20 px-3 py-1 rounded-full text-xs font-semibold text-white bg-black border-2 border-white shadow-lg"
      >
        Profissional
      </div>
    );
  }

  if (isEditor) {
    return (
      <div 
        className="absolute -top-3 right-2 z-20 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gray-800 border-2 border-white shadow-lg"
      >
        Editor
      </div>
    );
  }

  if (isEditorPro) {
    return (
      <div 
        className="absolute -top-3 right-2 z-20 px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-gray-800 to-black border-2 border-white shadow-lg"
      >
        Editor PRO
      </div>
    );
  }
  
  return null;
};

export default PlanBadge;
