
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Benefit {
  title: string;
  items: string[];
}

interface CampaignBenefitsProps {
  benefits: Benefit[];
}

const CampaignBenefits: React.FC<CampaignBenefitsProps> = ({ benefits }) => {
  return (
    <div className="space-y-4">
      {benefits.map((benefit, benefitIndex) => (
        <div key={benefitIndex} className="space-y-2">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            {benefit.title}
          </h4>
          <ul className="space-y-1 ml-6">
            {benefit.items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <ArrowRight className="h-3 w-3 mt-0.5 text-gray-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default CampaignBenefits;
