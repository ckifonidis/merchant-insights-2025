import { useTranslation } from 'react-i18next';

const DashboardHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dashboard.title')}</h2>
      <p className="text-gray-600">{t('dashboard.subtitle')}</p>
    </div>
  );
};

export default DashboardHeader;
