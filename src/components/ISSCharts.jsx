import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ISSSpeedChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-[300px] flex items-center justify-center">
        <span className="text-slate-400">Waiting for speed data...</span>
      </div>
    );
  }

  // Format data for chart
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    speed: d.speed ? Math.round(d.speed) : 0,
  }));

  // We want to avoid rendering if all speeds are 0 or not calculated yet
  const hasValidData = chartData.some(d => d.speed > 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-[350px]">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">ISS Speed Trend (Last 30 mins)</h3>
      {!hasValidData ? (
         <div className="h-[250px] flex items-center justify-center text-slate-500">Calculating speed trajectory...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              domain={['auto', 'auto']}
              tickFormatter={(value) => `${value} km/h`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Line 
              type="monotone" 
              dataKey="speed" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export const NewsDistributionChart = ({ newsData }) => {
  // Mock distribution since we might only fetch one category initially or just aggregate sources
  // For the Pie chart, let's aggregate by Source
  
  const getDistribution = () => {
    if (!newsData || newsData.length === 0) return [];
    
    const sourceCount = {};
    newsData.forEach(article => {
      let source = article.source?.name || 'Unknown';
      // Truncate long source names to prevent legend overflow
      if (source.length > 15) {
        source = source.substring(0, 15) + '...';
      }
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    return Object.keys(sourceCount).map(key => ({
      name: key,
      value: sourceCount[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 sources
  };

  const data = getDistribution();

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-[350px] flex items-center justify-center">
        <span className="text-slate-400">No news data available for chart.</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-[350px] flex flex-col">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 shrink-0">News by Source</h3>
      <div className="flex-grow w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="40%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Legend 
              verticalAlign="bottom" 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', paddingtop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
