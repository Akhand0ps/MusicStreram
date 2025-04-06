import { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import axios from 'axios';

// Using a simpler, more reliable model
const MODEL_URL = 'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';
const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;

function AIChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm your AI music assistant. Tell me any situation, mood, or story, and I'll suggest the perfect songs for you!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { setCurrentSong } = usePlayer();

  const analyzeSentiment = async (text) => {
    try {
      const response = await fetch(MODEL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: text
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sentiment analysis response:', data); // Debug log
      return data[0];

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return null;
    }
  };

  const generateResponse = async (text, sentiment) => {
    try {
      // Using GPT-2 for generating responses
      const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Given the mood: ${sentiment} and context: "${text}", suggest 3 songs that would be perfect for this situation. Include both Hindi and English songs.`,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            num_return_sequences: 1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Generation response:', data); // Debug log
      return data[0].generated_text;

    } catch (error) {
      console.error('Error generating response:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);

    try {
      // Add thinking message
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "Let me think about that..." 
      }]);

      // Analyze sentiment
      const sentimentResult = await analyzeSentiment(userMessage);
      
      if (!sentimentResult) {
        throw new Error('Sentiment analysis failed');
      }

      // Generate response based on sentiment
      const response = await generateResponse(userMessage, sentimentResult.label);

      if (response) {
        // Extract song suggestions from the response
        const songs = response
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.trim());

        // Add response message
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: "Based on what you shared, here are some songs that might resonate with you:" 
        }]);

        // Add each song as a playable message
        songs.forEach(song => {
          if (song.length > 0) {
            setMessages(prev => [...prev, {
              type: 'bot',
              isPlayable: true,
              songTitle: song,
              text: song
            }]);
          }
        });
      } else {
        throw new Error('Failed to generate response');
      }

    } catch (error) {
      console.error('Error in chat flow:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "I'm having trouble processing your request. Please try again with a different description." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playSong = async (songTitle) => {
    try {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: `🎵 Finding "${songTitle}" for you...` 
      }]);

      const response = await axios.get(`http://localhost:5002/search`, {
        params: { query: songTitle }
      });

      if (response.data?.videos?.[0]) {
        const song = response.data.videos[0];
        setCurrentSong({
          id: song.id,
          title: song.title,
          artist: song.channel,
          thumbnailUrl: song.thumbnail,
          audioUrl: `http://localhost:5002/get-audio-url/${song.id}`
        });

        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: `▶️ Now playing: ${song.title}` 
        }]);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: "Sorry, I couldn't play that song. Please try another one." 
      }]);
    }
  };

  // First, let's create a new function to get lyrics using Hugging Face API
  const getLyricsFromHuggingFace = async (songTitle, artist) => {
    const MODEL_URL = 'https://api-inference.huggingface.co/models/gpt2-large';
    const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;

    try {
      const response = await fetch(MODEL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Generate lyrics for the song "${songTitle}" by ${artist}:\n\n`,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            num_return_sequences: 1,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lyrics');
      }

      const data = await response.json();
      return data[0].generated_text;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  };

  // Message component
  const Message = ({ message }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        message.type === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-800 text-gray-100'
      }`}>
        {message.type === 'bot' && (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mb-2">
            <i className="fas fa-robot text-xs"></i>
          </div>
        )}
        <p className="text-sm">{message.text}</p>
        {message.isPlayable && (
          <button
            onClick={() => playSong(message.songTitle)}
            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-sm flex items-center gap-2 transition-colors"
          >
            <i className="fas fa-play"></i>
            Play this song
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">AI Music Assistant</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="h-96 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent p-4">
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me how you're feeling or what's on your mind..."
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </form>
    </div>
  );
}

export default AIChatbot; 
