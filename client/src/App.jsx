"use client"

import { PlayerProvider } from "./context/PlayerContext"
import Player from "./components/Player"
import Search from "./pages/Search"
import AIChatbot from "./components/AIChatbot"
import { useState, useEffect } from "react"

const API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY
const MODEL_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"

export async function getChatbotResponse(input) {
  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: input }),
    })

    if (!response.ok) {
      throw new Error("Failed to get response from chatbot")
    }

    const data = await response.json()
    return data.generated_text || "Sorry, I didn't get that. Try again."
  } catch (error) {
    console.error(error)
    return "Oops! Something went wrong with the chatbot."
  }
}

function App() {
  const [showSearch, setShowSearch] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile or tablet
  useEffect(() => {
    const checkDeviceSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkDeviceSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkDeviceSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkDeviceSize)
  }, [])

  const goToHome = () => {
    setShowSearch(false)
    setShowChatbot(false)
  }

  return (
    <PlayerProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e] relative">
        <div className="min-h-screen pb-24">
          {!showSearch ? (
            <div className="min-h-screen flex flex-col">
              {/* Hero Section */}
              <div className="relative flex-1">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3')] bg-cover bg-center">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                </div>

                <div className="relative z-10 h-full">
                  {/* Navbar */}
                  <header className="container mx-auto px-4 py-4 sm:py-6">
                    <nav className="flex justify-between items-center flex-wrap gap-4">
                      <div
                        onClick={goToHome}
                        className="text-white text-xl sm:text-2xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <i className="fas fa-headphones-alt"></i>
                        <span className={isMobile ? "text-lg" : ""}>MusicStream</span>
                      </div>
                      <button
                        onClick={() => setShowSearch(true)}
                        className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base transition-all border border-white/20 backdrop-blur-md"
                      >
                        <i className="fas fa-search mr-2"></i>
                        Search Music
                      </button>
                    </nav>
                  </header>

                  {/* Hero Content */}
                  <main className="container mx-auto px-4 flex items-center h-[calc(100vh-320px)] md:h-[calc(100vh-280px)]">
                    <div className="max-w-3xl">
                      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                        Your Music,
                        <br />
                        Your Moment,
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                          Anytime, Anywhere
                        </span>
                      </h1>
                      <p className="text-sm sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                        Stream millions of songs instantly. Discover new artists and create your perfect playlist. Start
                        your musical journey today.
                      </p>
                      <button
                        onClick={() => setShowSearch(true)}
                        className="px-5 sm:px-8 py-2.5 sm:py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 group"
                      >
                        Get Started
                        <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                      </button>
                    </div>
                  </main>

                  {/* Feature Cards */}
                  <div className="container mx-auto px-4 py-8 sm:py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div
                        onClick={() => setShowSearch(true)}
                        className="text-white text-center cursor-pointer transform hover:scale-105 transition-transform p-4 sm:p-6 rounded-xl hover:bg-white/5"
                      >
                        <i className="fas fa-microphone-alt text-xl sm:text-3xl mb-3 sm:mb-4 text-pink-400"></i>
                        <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">Lyrics Included</h3>
                        <p className="text-gray-400 text-xs sm:text-base">Sing along with synchronized lyrics</p>
                      </div>
                      <div
                        onClick={() => setShowChatbot(true)}
                        className="text-white text-center cursor-pointer transform hover:scale-105 transition-transform p-4 sm:p-6 rounded-xl hover:bg-white/5"
                      >
                        <i className="fas fa-robot text-xl sm:text-3xl mb-3 sm:mb-4 text-green-400"></i>
                        <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">Mood Music</h3>
                        <p className="text-gray-400 text-xs sm:text-base">
                          Get AI song recommendations based on your mood
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <footer className="bg-black/30 backdrop-blur-md mt-auto">
                    <div className="container mx-auto px-4 py-6 sm:py-8">
                      <h2 className="text-white text-lg sm:text-2xl font-bold mb-4">Project Group Members</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Akhand */}
                        <div className="flex items-center gap-3 sm:gap-4">
                          <img
                            src="https://github.com/Akhand0ps.png"
                            alt="Akhand"
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-500"
                          />
                          <div className="text-white">
                            <h3 className="text-base sm:text-xl font-bold">Akhand Pratap Singh</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Reg No: 12326117</p>
                            <div className="flex gap-3 mt-1 sm:mt-2">
                              <a
                                href="https://github.com/Akhand0ps"
                                target="_blank"
                                className="hover:text-white text-gray-400"
                                rel="noreferrer"
                              >
                                <i className="fab fa-github text-lg sm:text-2xl"></i>
                              </a>
                              <a
                                href="https://www.linkedin.com/in/akhand-pratap-singh-286770275/"
                                target="_blank"
                                className="hover:text-white text-gray-400"
                                rel="noreferrer"
                              >
                                <i className="fab fa-linkedin text-lg sm:text-2xl"></i>
                              </a>
                              <a
                                href="https://x.com/akhand_06x"
                                target="_blank"
                                className="hover:text-white text-gray-400"
                                rel="noreferrer"
                              >
                                <i className="fab fa-twitter text-lg sm:text-2xl"></i>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Apoorva */}
                        <div className="flex items-center gap-3 sm:gap-4">
                          <img
                            src="https://github.com/apoorva-katyayan.png"
                            alt="Apoorva"
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-purple-500"
                          />
                          <div className="text-white">
                            <h3 className="text-base sm:text-xl font-bold">Apoorva Katyayan</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">Reg No: 12309607</p>
                            <div className="flex gap-3 mt-1 sm:mt-2">
                              <a
                                href="https://github.com/apoorva-katyayan"
                                target="_blank"
                                className="hover:text-white text-gray-400"
                                rel="noreferrer"
                              >
                                <i className="fab fa-github text-lg sm:text-2xl"></i>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-screen pb-24">
              <button
                onClick={goToHome}
                className="fixed top-2 sm:top-4 left-2 sm:left-4 z-50 px-2 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-base transition-all border border-white/20 backdrop-blur-md flex items-center gap-1 sm:gap-2"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </button>
              <Search />
            </div>
          )}
        </div>

        {/* 🎵 Player */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <Player />
        </div>

        {/* 🤖 Chatbot Modal */}
        {showChatbot && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
          >
            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
              <AIChatbot onClose={() => setShowChatbot(false)} />
            </div>
          </div>
        )}
      </div>
    </PlayerProvider>
  )
}

export default App

