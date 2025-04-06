"use client"

import { useState, useRef, useEffect } from "react"
import { usePlayer } from "../context/PlayerContext"
import axios from "axios"

function Player() {
  const audioRef = useRef(null)
  const { currentSong, setCurrentSong, isPlaying, setIsPlaying, queue, nextSong } = usePlayer()

  const [lyrics, setLyrics] = useState("")
  const [lyricsLoading, setLyricsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showLyrics, setShowLyrics] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showVolumeControl, setShowVolumeControl] = useState(false)

  const defaultMusicIcon = "data:image/svg+xml;base64,..." // fallback

  // Check if device is mobile
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-minimize on small screens initially
      if (window.innerWidth < 480 && !isMinimized) {
        setIsMinimized(true)
      }
    }

    // Initial check
    checkDeviceSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkDeviceSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkDeviceSize)
  }, [])

  useEffect(() => {
    if (currentSong?.title) fetchLyrics(currentSong.title)
  }, [currentSong])

  useEffect(() => {
    const loadAudio = async () => {
      if (!currentSong?.audioUrl) return
      try {
        const res = await axios.get(`http://localhost:5002/get-audio-url/${currentSong.id}`)
        if (res.data?.url) {
          audioRef.current.src = res.data.url
          if (isPlaying) audioRef.current.play()
        }
      } catch (err) {
        console.error("Audio load error:", err)
        setIsPlaying(false)
      }
    }
    loadAudio()
  }, [currentSong])

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause()
    }
  }, [isPlaying])

  const fetchLyrics = async (title) => {
    try {
      setLyricsLoading(true)
      const res = await axios.get(`http://localhost:5002/lyrics`, { params: { title } })
      setLyrics(res.data?.lyrics || "Lyrics not found.")
    } catch {
      setLyrics("Failed to fetch lyrics.")
    } finally {
      setLyricsLoading(false)
    }
  }

  const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime)
  const handleLoadedMetadata = () => setDuration(audioRef.current.duration)
  const handleSeek = (e) => {
    const time = Number.parseFloat(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }
  const handleVolumeChange = (e) => {
    const value = Number.parseFloat(e.target.value)
    audioRef.current.volume = value
    setVolume(value)
  }
  const handleEnded = () => {
    if (queue.length > 0) {
      nextSong()
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
  }
  const formatTime = (time) => {
    const min = Math.floor(time / 60)
    const sec = Math.floor(time % 60)
      .toString()
      .padStart(2, "0")
    return `${min}:${sec}`
  }

  const toggleVolumeControl = () => {
    setShowVolumeControl(!showVolumeControl)
  }

  const toggleMute = () => {
    if (volume > 0) {
      audioRef.current.volume = 0
      setVolume(0)
    } else {
      audioRef.current.volume = 1
      setVolume(1)
    }
  }

  if (!currentSong)
    return <div className="fixed bottom-0 w-full bg-gray-900 text-white p-3 text-center text-sm">No song selected</div>

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111826] text-white shadow-lg z-50">
      {/* Lyrics Panel */}
      {showLyrics && (
        <div className="absolute bottom-full w-full bg-[#112426] border-t border-gray-700 max-h-[30vh] sm:max-h-[40vh] overflow-y-auto z-50">
          <div className="p-3 md:p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base md:text-xl font-bold">Lyrics</h3>
              <button
                onClick={() => setShowLyrics(false)}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Close lyrics"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            {lyricsLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-xs sm:text-sm md:text-base">{lyrics}</pre>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
        {/* Minimizer Button */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex-1">
            {isMinimized && (
              <div className="flex items-center">
                <img
                  src={currentSong.thumbnailUrl || defaultMusicIcon}
                  alt=""
                  className="w-6 h-6 rounded-sm object-cover mr-2"
                  onError={(e) => (e.target.src = defaultMusicIcon)}
                />
                <p className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
                  {currentSong.title}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white p-1"
            aria-label={isMinimized ? "Expand player" : "Minimize player"}
          >
            <i className={`fas ${isMinimized ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
          </button>
        </div>

        {/* Timeline Bar */}
        {!isMinimized && (
          <div className="mb-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 accent-pink-500 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              aria-label="Seek timeline"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isMinimized && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Song Info */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <img
                src={currentSong.thumbnailUrl || defaultMusicIcon}
                alt={currentSong.title}
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-md object-cover"
                onError={(e) => (e.target.src = defaultMusicIcon)}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm md:text-base truncate">{currentSong.title}</p>
                <p className="text-gray-400 text-xs md:text-sm truncate">{currentSong.artist || "Unknown Artist"}</p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex gap-2 sm:gap-3 items-center justify-start flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"} text-white text-xs sm:text-sm`}></i>
              </button>

              <button
                onClick={() => {
                  nextSong()
                  setIsPlaying(true)
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
                aria-label="Next song"
              >
                <i className="fas fa-forward text-white text-xs sm:text-sm"></i>
              </button>

              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className="px-3 py-1 sm:px-4 sm:py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-xs"
                aria-label="Show lyrics"
              >
                <i className="fas fa-microphone-alt mr-1"></i>Lyrics
              </button>
            </div>

            {/* Volume Control */}
            <div className="relative flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
              <button
                onClick={isMobile ? toggleVolumeControl : toggleMute}
                className="text-gray-400 hover:text-white p-1"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                <i
                  className={`fas ${
                    volume === 0 ? "fa-volume-mute" : volume < 0.5 ? "fa-volume-down" : "fa-volume-up"
                  } text-sm md:text-base`}
                ></i>
              </button>

              {(!isMobile || showVolumeControl) && (
                <div
                  className={`${isMobile ? "absolute bottom-full left-0 mb-2 bg-gray-800 p-2 rounded-lg shadow-lg" : "flex items-center"}`}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 sm:w-24 h-1.5 accent-pink-500 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    aria-label="Volume"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onError={() => setIsPlaying(false)}
        />
      </div>
    </div>
  )
}

export default Player

