import { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);

  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (queue.length > 0) {
      const next = queue[0];
      const remainingQueue = queue.slice(1);
      setCurrentSong(next);
      setQueue(remainingQueue);
      setIsPlaying(true); // ✅ Start playing the next song automatically
    } else {
      setIsPlaying(false); // 🛑 No song left, stop
    }
  };

  const previousSong = () => {
    // Add previous logic if you store a history
  };

  const addToQueue = (song) => {
    setQueue([...queue, song]);
  };

  const value = {
    currentSong,
    setCurrentSong,
    isPlaying,
    setIsPlaying,
    queue,
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    addToQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
