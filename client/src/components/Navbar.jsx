import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-indigo-600">
                LyricsFinder
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/search" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                Search
              </Link>
              <Link to="/chatbot" className="text-gray-700 hover:text-indigo-600 px-3 py-2">
                AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 