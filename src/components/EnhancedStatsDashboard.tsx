import React from 'react';
import LanguagesSummaryHeader from './LanguagesSummaryHeader';
import StatsDashboard from './StatsDashboard';

interface EnhancedStatsDashboardProps {
  selectedLanguages: string[];
}

const EnhancedStatsDashboard = React.forwardRef<HTMLDivElement, EnhancedStatsDashboardProps>(
  ({ selectedLanguages }, ref) => {
    return (
      <div ref={ref} className="space-y-4 bg-background p-4 rounded-lg">
        <LanguagesSummaryHeader selectedLanguages={selectedLanguages} />
        <StatsDashboard selectedLanguages={selectedLanguages} />
      </div>
    );
  }
);

EnhancedStatsDashboard.displayName = 'EnhancedStatsDashboard';

export default EnhancedStatsDashboard;