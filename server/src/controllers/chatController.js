import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // From Firebase auth middleware

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable music assistant. Help users discover music, 
          understand lyrics, and get mood-based recommendations. Keep responses concise 
          and engaging. When recommending songs, include artist names and brief context.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;

    // Process response for any song recommendations
    const recommendations = extractRecommendations(response);

    res.json({
      response,
      recommendations
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

function extractRecommendations(response) {
  // Simple regex to extract song recommendations
  // This could be made more sophisticated based on the AI response format
  const recommendations = [];
  const regex = /["'](.+?)["']\s+by\s+(.+?)(?=[,.]\s|$)/g;
  let match;

  while ((match = regex.exec(response)) !== null) {
    recommendations.push({
      title: match[1],
      artist: match[2]
    });
  }

  return recommendations;
} 