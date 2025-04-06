// src/pages/PlayerPage.jsx

import { usePlayer } from "../context/PlayerContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PlayerPage() {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    nextSong,
    queue,
  } = usePlayer();

  const audioRef = useRef(null);
  const [lyrics, setLyrics] = useState("");
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const navigate = useNavigate();

  const defaultMusicIcon = "data:image/svg+xml;base64,...";

  useEffect(() => {
    if (currentSong?.title) fetchLyrics(currentSong.title);
  }, [currentSong]);

  const fetchLyrics = async (title) => {
    try {
      setLyricsLoading(true);
      const res = await axios.get(`http://localhost:5002/lyrics`, { params: { title } });
      setLyrics(res.data?.lyrics || "Lyrics not found.");
    } catch {
      setLyrics("Failed to fetch lyrics.");
    } finally {
      setLyricsLoading(false);
    }
  };

  useEffect(() => {
    const loadAudio = async () => {
      if (!currentSong?.audioUrl) return;
      try {
        const res = await axios.get(`http://localhost:5002/get-audio-url/${currentSong.id}`);
        if (res.data?.url) {
          audioRef.current.src = res.data.url;
          if (isPlaying) audioRef.current.play();
        }
      } catch (err) {
        console.error("Audio load error:", err);
        setIsPlaying(false);
      }
    };
    loadAudio();
  }, [currentSong]);

  const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
  const handleLoadedMetadata = () => setDuration(audioRef.current.duration);
  const handleSeek = (e) => setCurrentTime(audioRef.current.currentTime = parseFloat(e.target.value));
  const handleVolumeChange = (e) => setVolume(audioRef.current.volume = parseFloat(e.target.value));
  const handleEnded = () => {
    if (queue.length > 0) {
      nextSong();
      setIsPlaying(true);
    } else setIsPlaying(false);
  };

  const formatTime = (time) => `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, "0")}`;

  if (!currentSong) return <div className="text-white text-center mt-10">No song selected.</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6">
        ← Back
      </button>

      <div className="flex flex-col md:flex-row items-center gap-10">
        <img
          src={currentSong.thumbnailUrl || defaultMusicIcon}
          alt="Thumbnail"
          className="w-60 h-60 md:w-80 md:h-80 object-cover rounded-xl shadow-lg"
        />
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-bold">{currentSong.title}</h1>
          <p className="text-gray-400 text-lg mb-4">{currentSong.artist || "Unknown Artist"}</p>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-pink-500 mb-2"
          />
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="bg-pink-600 hover:bg-pink-700 w-12 h-12 rounded-full flex items-center justify-center">
              <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"} text-white`}></i>
            </button>
            <button onClick={() => { nextSong(); setIsPlaying(true); }} className="bg-gray-700 hover:bg-gray-600 w-12 h-12 rounded-full flex items-center justify-center">
              <i className="fas fa-forward text-white"></i>
            </button>

            <div className="flex items-center gap-2">
              <i className={`fas ${volume === 0 ? "fa-volume-mute" : "fa-volume-up"}`}></i>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>

          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={() => setIsPlaying(false)}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Lyrics</h2>
        <div className="bg-gray-800 p-4 rounded-lg max-h-80 overflow-y-auto">
          {lyricsLoading ? <p>Loading lyrics...</p> : <pre className="whitespace-pre-wrap">{lyrics}</pre>}
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;
