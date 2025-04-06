import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import axios from 'axios';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setCurrentSong } = usePlayer();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5002/search`, {
        params: { query: searchQuery }
      });

      if (response.data?.videos) {
        setSearchResults(
          response.data.videos.map((video) => ({
            id: video.id,
            title: video.title,
            artist: video.channel,
            thumbnailUrl: video.thumbnail,
            audioUrl: `http://localhost:5002/get-audio-url/${video.id}`
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongClick = (song) => {
    setCurrentSong(song);
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white px-4 py-10">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full p-3 rounded-full bg-[#2a2a2a] placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
          <button
            type="submit"
            className="bg-[#1DB954] text-black px-5 py-3 rounded-full font-medium hover:bg-[#1ed760] transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {isLoading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : searchResults.length > 0 ? (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-6xl mx-auto">
          {searchResults.map((song) => (
            <div
              key={song.id}
              onClick={() => handleSongClick(song)}
              className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] cursor-pointer transition"
            >
              <div className="relative">
                <img
                  src={song.thumbnailUrl}
                  alt={song.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <button className="absolute bottom-3 right-3 bg-[#1DB954] w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition">
                  <i className="fas fa-play text-black text-sm"></i>
                </button>
              </div>
              <h3 className="text-sm font-semibold truncate">{song.title}</h3>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      ) : (
        searchQuery && (
          <div className="text-center mt-20 text-gray-500">
            <i className="fas fa-music text-4xl mb-4"></i>
            <p>No songs found. Try a different search.</p>
          </div>
        )
      )}
    </div>
  );
}

export default Search;
