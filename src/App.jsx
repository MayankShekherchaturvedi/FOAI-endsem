import { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import ISSStats from './components/ISSStats';
import ISSMap from './components/ISSMap';
import { ISSSpeedChart, NewsDistributionChart } from './components/ISSCharts';
import NewsDashboard from './components/NewsDashboard';
import Chatbot from './components/Chatbot';

import { fetchISSPosition, fetchAstros, fetchLocationName } from './services/issService';
import { fetchNews } from './services/newsService';

function App() {
  // ISS State
  const [issData, setIssData] = useState(null);
  const [issTrajectory, setIssTrajectory] = useState([]);
  const [speedHistory, setSpeedHistory] = useState([]);
  const [astrosData, setAstrosData] = useState(null);
  const [issLoading, setIssLoading] = useState(true);

  // News State
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Error/Toast State
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch ISS Data
  const updateISSData = useCallback(async () => {
    try {
      const position = await fetchISSPosition();
      const locationName = await fetchLocationName(position.lat, position.lng);
      
      const enrichedPosition = { ...position, locationName };
      
      setIssData(enrichedPosition);
      
      setIssTrajectory(prev => {
        const newTrajectory = [...prev, enrichedPosition];
        return newTrajectory.slice(-15); // Keep last 15
      });
      
      setSpeedHistory(prev => {
        const newHistory = [...prev, enrichedPosition];
        return newHistory.slice(-30); // Keep last 30
      });
      
      setIssLoading(false);
    } catch (error) {
      console.error("ISS update failed", error);
      showNotification("Failed to update ISS location", "error");
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    const initApp = async () => {
      try {
        // Fetch astros once
        const astros = await fetchAstros();
        setAstrosData(astros);
        
        // Fetch initial ISS
        await updateISSData();
        
        // Fetch news
        await updateNews();
      } catch (error) {
        showNotification("Error loading dashboard data", "error");
      }
    };
    
    initApp();

    // Poll ISS every 15 seconds
    const interval = setInterval(() => {
      updateISSData();
    }, 15000);

    return () => clearInterval(interval);
  }, [updateISSData]);

  // Fetch News
  const updateNews = async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      const articles = await fetchNews('science', forceRefresh);
      setNews(articles);
    } catch (error) {
      showNotification("Failed to load news", "error");
    } finally {
      setNewsLoading(false);
    }
  };

  // Prepare context for Chatbot
  const dashboardContext = {
    iss: issData,
    astros: astrosData,
    news: news
  };

  return (
    <Layout>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`px-4 py-2 rounded-lg shadow-lg font-medium text-sm ${
            notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
          }`}>
            {notification.message}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Space Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Real-time tracking, news, and AI insights.</p>
      </div>

      <ISSStats issData={issData} astrosData={astrosData} loading={issLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ISSMap position={issData} trajectory={issTrajectory} />
          <ISSSpeedChart data={speedHistory} />
        </div>
        <div className="lg:col-span-1">
          <NewsDistributionChart newsData={news} />
        </div>
      </div>

      <div className="mb-12">
        <NewsDashboard news={news} loading={newsLoading} onRefresh={updateNews} />
      </div>

      <Chatbot dashboardContext={dashboardContext} />
    </Layout>
  );
}

export default App;
