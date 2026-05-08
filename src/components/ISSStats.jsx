import { MapPin, Navigation, Users, Globe2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, subtitle }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </div>
);

const ISSStats = ({ issData, astrosData, loading }) => {
  if (loading && !issData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse h-32">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const speed = issData?.speed ? `${issData.speed.toFixed(0)} km/h` : 'Calculating...';
  const location = issData?.locationName || 'Updating...';
  const coords = issData ? `${issData.lat.toFixed(4)}°, ${issData.lng.toFixed(4)}°` : '---';
  const astrosCount = astrosData?.number || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Current Coordinates" 
        value={coords} 
        icon={MapPin} 
        subtitle="Latitude, Longitude"
      />
      <StatCard 
        title="Current Speed" 
        value={speed} 
        icon={Navigation} 
        subtitle="Orbital Velocity"
      />
      <StatCard 
        title="Nearest Location" 
        value={location} 
        icon={Globe2} 
        subtitle="Reverse Geocoded"
      />
      <StatCard 
        title="People in Space" 
        value={astrosCount} 
        icon={Users} 
        subtitle={astrosData?.people?.map(p => p.name).slice(0, 2).join(', ') + (astrosCount > 2 ? '...' : '')}
      />
    </div>
  );
};

export default ISSStats;
