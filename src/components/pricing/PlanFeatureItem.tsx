
import React from 'react';
import { Check, X } from 'lucide-react';

interface PlanFeatureItemProps {
  text: string;
  included: boolean;
  highlight?: boolean;
  isDarkTheme?: boolean;
}

const PlanFeatureItem = ({ text, included, highlight, isDarkTheme }: PlanFeatureItemProps) => {
  const iconColor = isDarkTheme ? '#ffffff' : (included ? '#10b981' : '#ef4444');
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-700';

  return (
    <li className={`flex items-center gap-2 ${highlight ? 'font-semibold' : ''}`}>
      {included ? (
        <Check 
          className="h-4 w-4 flex-shrink-0" 
          style={{ color: iconColor }}
        />
      ) : (
        <X 
          className="h-4 w-4 flex-shrink-0 text-red-500" 
        />
      )}
      <span className={`text-sm ${textColor}`}>
        {text}
      </span>
    </li>
  );
};

export default PlanFeatureItem;
