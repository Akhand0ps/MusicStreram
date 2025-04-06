import React from 'react';

function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to LyricsFinder
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Search for songs, discover lyrics, and create your perfect playlist
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🎵 Features</h2>
          <ul className="space-y-2">
            <li>Search songs by title, artist, or lyrics</li>
            <li>Stream full audio with synchronized lyrics</li>
            <li>Create and manage personal playlists</li>
            <li>Get AI-powered music recommendations</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">🤖 AI Assistant</h2>
          <p className="mb-4">
            Get personalized music recommendations and answers to your music-related questions
          </p>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Try AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home; 