import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { Users } from 'lucide-react';

const TotalCustomersMetric = ({ title }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <UniversalMetricCard
        metricId="total_customers"
        variant="detailed"
        title={title}
        icon={
          <div className="text-purple-600">
            <Users className="w-5 h-5" />
          </div>
        }
        iconBackground="bg-purple-50"
      />
    </div>
  );
};

export default TotalCustomersMetric;