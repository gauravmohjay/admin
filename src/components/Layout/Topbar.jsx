import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, User, User2 } from "lucide-react";
import { scheduleAPI } from "../../services/api";

const Topbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await scheduleAPI.searchSchedules(searchQuery);
          setSearchResults(results.schedules || []);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (schedule) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/schedules/${schedule.platformId}/${schedule.scheduleId}`, {
      state: { schedule },
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => {
              navigate("/dashboard");
            }}
            className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-black" />
            </div>
            <span className="text-sm font-medium text-gray-700">home</span>
          </button>
        </div>
        {/* Search */}
        <div className="relative mx-auto flex-1 max-w-2xl" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules, hosts & groups"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""} found
                  </div>
                  {searchResults.map((schedule, index) => (
                    <button
                      key={schedule._id || index}
                      className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleResultClick(schedule)}
                    >
                      <div className="font-medium text-gray-900">
                        {schedule.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.hostName} — {schedule.group} —{" "}
                        {schedule.scheduleId}
                      </div>
                    </button>
                  ))}
                </>
              ) : searchQuery.trim() ? (
                <div className="px-3 py-6 text-center text-gray-500">
                  No schedules found for "{searchQuery}"
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.dispatchEvent(new Event("storage"));
              navigate("/");
            }}
            className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <User2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-sm font-medium text-gray-700">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
