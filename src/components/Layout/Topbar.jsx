import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Using User and LogOut for a more professional look, replacing User2 for Log out
import { Home, Search, LogOut } from "lucide-react"; 
import { scheduleAPI } from "../../services/api";

const Topbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Primary color: red-700, Secondary text: gray-800, Hover/Active: red-800

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          // Assuming scheduleAPI.searchSchedules is defined elsewhere
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
    // Professional header: clean white background, subtle border
    <header className="bg-white shadow-md/5 border-b border-gray-100 px-4 md:px-8 py-3">
      <div className="flex items-center justify-between">
        
        {/* Logo/Home Button - More understated and professional */}
        <div>
          <button
            onClick={() => {
              navigate("/dashboard");
            }}
            className="flex cursor-pointer items-center space-x-2 p-2 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
          >
   
            <img src="/mohjay_black.png" className=" w-20 h-10 object-cover"></img>
            {/* <Home className="w-5 h-5" />
            <span className="text-sm hidden md:block font-semibold text-gray-800">
              Home
            </span> */}
          </button>
        </div>
        
        {/* Search - Central and prominent */}
        <div className="relative mx-auto flex-1 max-w-xl" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules, hosts, or groups..."
                // Focus on border and ring for a cleaner look
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-700 focus:border-red-700 transition-all text-gray-700 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && searchResults.length > 0 && setShowResults(true)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {/* Professional spinner using red-700 */}
                  <div className="animate-spin h-4 w-4 border-2 border-red-700 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </form>

          {/* Search Results Dropdown - Professional card-like structure */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                <>
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 border-b border-gray-200 rounded-t-xl">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                  </div>
                  {searchResults.map((schedule, index) => (
                    <button
                      key={schedule._id || index}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                      onClick={() => handleResultClick(schedule)}
                    >
                      <div className="font-semibold text-gray-900 truncate">
                        {schedule.title}
                      </div>
                      {/* Sub-text for context */}
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-red-700">{schedule.hostName}</span>
                        {' '}— {schedule.group} — ID: {schedule.scheduleId}
                      </div>
                    </button>
                  ))}
                </>
              ) : searchQuery.trim() ? (
                <div className="px-4 py-6 text-center text-gray-500">
                  No schedules found for **"{searchQuery}"**
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* User Menu/Action - Clean action button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.dispatchEvent(new Event("storage"));
              navigate("/");
            }}
            // Logout button styled as a high-contrast action button
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 rounded-xl text-white bg-red-700 hover:bg-red-800 transition-colors shadow-md"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm hidden md:block font-semibold">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;