import { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import axios from 'axios';

const moodSuggestions = {
  happy: [
    "Don't Stop Believin' - Journey",
    "Happy - Pharrell Williams",
    "I Wanna Dance with Somebody - Whitney Houston",
    "Walking on Sunshine - Katrina & The Waves",
    "Uptown Funk - Mark Ronson ft. Bruno Mars"
  ],
  sad: [
    "Someone Like You - Adele",
    "All By Myself - Celine Dion",
    "Yesterday - The Beatles",
    "Say Something - A Great Big World",
    "The Sound of Silence - Simon & Garfunkel"
  ],
  energetic: [
    "Eye of the Tiger - Survivor",
    "Can't Hold Us - Macklemore",
    "Stronger - Kanye West",
    "Thunder - Imagine Dragons",
    "Levels - Avicii"
  ],
  romantic: [
    "Perfect - Ed Sheeran",
    "All of Me - John Legend",
    "Just the Way You Are - Bruno Mars",
    "At Last - Etta James",
    "Can't Help Falling in Love - Elvis Presley"
  ],
  relaxed: [
    "Somewhere Over the Rainbow - Israel Kamakawiwo'ole",
    "What a Wonderful World - Louis Armstrong",
    "Peaceful Easy Feeling - Eagles",
    "Here Comes the Sun - The Beatles",
    "Three Little Birds - Bob Marley"
  ]
};

function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm your music mood assistant. How are you feeling today? (happy, sad, energetic, romantic, or relaxed)"
    }
  ]);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const { setCurrentSong } = usePlayer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSongSelect = async (songTitle) => {
    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:5002/search`, {
        params: { query: songTitle }
      });

      if (response.data && response.data.videos && response.data.videos.length > 0) {
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
          text: `Playing "${song.title}" for you! 🎵`
        }]);
      }
    } catch (error) {
      console.error('Error searching song:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "Sorry, I couldn't play that song. Please try another one."
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const processMessage = (userInput) => {
    const input = userInput.toLowerCase();
    let botResponse = '';
    let suggestions = [];

    if (input.includes('happy')) {
      suggestions = moodSuggestions.happy;
      botResponse = "Here are some happy songs to boost your mood! Click on any song to play it:";
    } else if (input.includes('sad')) {
      suggestions = moodSuggestions.sad;
      botResponse = "These songs might help express your feelings. Click on any to play:";
    } else if (input.includes('energetic') || input.includes('energy')) {
      suggestions = moodSuggestions.energetic;
      botResponse = "Let's get your energy up with these songs! Click to play:";
    } else if (input.includes('romantic') || input.includes('love')) {
      suggestions = moodSuggestions.romantic;
      botResponse = "Here are some romantic tunes for you. Click to play:";
    } else if (input.includes('relax') || input.includes('calm')) {
      suggestions = moodSuggestions.relaxed;
      botResponse = "These songs should help you relax. Click any to play:";
    } else {
      botResponse = "I'm not sure about that mood. Try saying 'happy', 'sad', 'energetic', 'romantic', or 'relaxed'!";
    }

    return { botResponse, suggestions };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: input }]);

    // Process the message
    const { botResponse, suggestions } = processMessage(input);

    // Add bot response
    setMessages(prev => [...prev, { 
      type: 'bot', 
      text: botResponse,
      suggestions: suggestions 
    }]);

    setInput('');
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">Music Mood Assistant</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-100'
            }`}>
              <p>{message.text}</p>
              {message.suggestions && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((song, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSongSelect(song)}
                      className="block w-full text-left px-2 py-1 rounded hover:bg-white/10 transition-colors text-sm"
                    >
                      🎵 {song}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me your mood..."
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          disabled={isSearching}
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isSearching}
        >
          {isSearching ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </form>
    </div>
  );
}

export default Chatbot; 