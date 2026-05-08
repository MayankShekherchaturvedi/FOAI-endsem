import axios from 'axios';

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';

export const sendChatMessage = async (message, dashboardContext) => {
  const token = import.meta.env.VITE_AI_TOKEN;
  
  if (!token) {
    return "Error: Hugging Face AI Token is missing. Please add VITE_AI_TOKEN to your .env file.";
  }

  // Construct a strict system prompt based on current dashboard state
  const systemPrompt = `You are a helpful AI assistant for a Space Dashboard. 
CRITICAL RULE: You can ONLY answer questions using the provided Dashboard Data below. Do NOT use outside knowledge. Do NOT guess. If the answer is not in the Dashboard Data, say "I can only answer based on the current dashboard data, and I don't have that information."

--- DASHBOARD DATA ---
ISS Current Location: Latitude ${dashboardContext.iss?.lat || 'Unknown'}, Longitude ${dashboardContext.iss?.lng || 'Unknown'}
ISS Speed: ${dashboardContext.iss?.speed ? dashboardContext.iss.speed.toFixed(2) : 'Unknown'} km/h
ISS Nearest Location: ${dashboardContext.iss?.locationName || 'Unknown'}
Astronauts in Space: ${dashboardContext.astros?.number || 0}
Astronaut Names: ${dashboardContext.astros?.people?.map(p => p.name).join(', ') || 'Unknown'}

Latest News Headlines:
${dashboardContext.news?.slice(0, 5).map(n => `- ${n.title} (Source: ${n.source?.name})`).join('\n') || 'No news available.'}
----------------------`;

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen3-0.6B:featherless-ai",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const result = await response.json();

    if (result.choices && result.choices.length > 0) {
      return result.choices[0].message.content.trim();
    }
    
    return "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Error with HF API:', error);
    return "Error communicating with the AI service. Please check your token or try again later.";
  }
};
