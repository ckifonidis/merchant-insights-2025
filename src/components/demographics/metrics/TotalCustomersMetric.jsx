import React from 'react';
import GenericMetricContainer from '../../containers/GenericMetricContainer';
import { Users } from 'lucide-react';

/**
 * Total Customers bespoke metric component for Demographics Tab
 * Now uses smart/presentational pattern with GenericMetricContainer
 */
const TotalCustomersMetric = ({ title }) => {
  return (
    <GenericMetricContainer
      title={title}
      metricId="total_customers"
      valueType="number"
      icon={
        <div className="text-purple-600">
          <Users className="w-5 h-5" />
        </div>
      }
      variant="detailed"
    />
  );
};

export default TotalCustomersMetric;