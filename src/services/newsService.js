import axios from 'axios';

const NEWS_API_URL = 'https://newsdata.io/api/1/latest';
const CACHE_KEY = 'space_dashboard_newsdata_cache_v2';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const fetchNews = async (category = 'science', forceRefresh = false) => {
  // Check cache first
  if (!forceRefresh) {
    const cachedDataStr = localStorage.getItem(`${CACHE_KEY}_${category}`);
    if (cachedDataStr) {
      const cachedData = JSON.parse(cachedDataStr);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION_MS) {
        return cachedData.articles;
      }
    }
  }

  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    if (!apiKey) {
      console.warn("No News API key provided. Using mock data.");
      return getMockNews();
    }

    const response = await axios.get(NEWS_API_URL, {
      params: {
        category,
        language: 'en',
        apikey: apiKey
      }
    });

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'Failed to fetch news');
    }

    const rawArticles = response.data.results || [];
    const articles = rawArticles.map(article => ({
      title: article.title,
      source: { name: article.source_id || 'Newsdata.io' },
      author: article.creator ? article.creator.join(', ') : 'Unknown',
      publishedAt: article.pubDate,
      urlToImage: article.image_url,
      description: article.description,
      url: article.link
    })).slice(0, 10);

    // Save to cache
    localStorage.setItem(`${CACHE_KEY}_${category}`, JSON.stringify({
      timestamp: Date.now(),
      articles: articles
    }));

    return articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    // Return mock data as fallback if API fails or rate limited
    return getMockNews();
  }
};

const getMockNews = () => [
  {
    title: "NASA's Artemis Program Makes Progress",
    source: { name: "SpaceNews" },
    author: "John Doe",
    publishedAt: new Date().toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1000",
    description: "NASA continues its steady progress towards returning humans to the moon.",
    url: "#"
  },
  {
    title: "New Exoplanet Discovered in Habitable Zone",
    source: { name: "Science Daily" },
    author: "Jane Smith",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1000",
    description: "Astronomers have discovered an Earth-sized exoplanet orbiting within the habitable zone of its star.",
    url: "#"
  },
  {
    title: "SpaceX Starship Prepares for Next Test Flight",
    source: { name: "TechCrunch" },
    author: "Alice Johnson",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=1000",
    description: "SpaceX is stacking its massive Starship rocket ahead of an anticipated orbital test flight.",
    url: "#"
  },
  {
    title: "James Webb Telescope Captures Stunning Galaxy",
    source: { name: "NASA" },
    author: "Bob Wilson",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=1000",
    description: "The James Webb Space Telescope has captured a highly detailed image of a distant spiral galaxy.",
    url: "#"
  },
  {
    title: "Meteor Shower Peaking This Weekend",
    source: { name: "Sky & Telescope" },
    author: "Carol White",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    urlToImage: "https://images.unsplash.com/photo-1520052205864-92d242b3a76b?auto=format&fit=crop&q=80&w=1000",
    description: "Look up! The annual Perseid meteor shower is set to peak this weekend with up to 60 meteors per hour.",
    url: "#"
  }
];
