import React from 'react';
import { UniversalMetricCard } from '../../ui';
import { Users } from 'lucide-react';

const TotalCustomersMetric = ({ title }) => {
  return (
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
  );
};

export default TotalCustomersMetric;