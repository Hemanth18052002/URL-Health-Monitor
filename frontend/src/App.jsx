import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8081';

function App() {
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedUrlId, setSelectedUrlId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');

  const validateUrl = (url) => {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchAllUrls = async () => {
    setLoading(true);
    setError('');
    setSelectedUrlId(null);
    setSource('database');
  
    try {
      const response = await axios.get(`${API_URL}/all-urls/`);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error fetching data from database.');
      console.error('DB Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUrls = async () => {
    if (!urls.trim()) {
      setError('Please enter at least one URL');
      return;
    }

    const urlList = urls.split(',').map(url => url.trim()).filter(url => url && validateUrl(url));
    if (urlList.length === 0) {
      setError('No valid URLs provided');
      return;
    }

    setLoading(true);
    setError('');
    setSource('searchBar');

    try {
      const response = await axios.post(`${API_URL}/check-urls/`, { urls: urlList });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error checking URLs. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewHistory = async (urlId) => {
    setHistoryLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/history/${urlId}`);
      setHistory(response.data);
      setSelectedUrlId(urlId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error fetching history. Please try again.');
      console.error('History Error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#3fe077] mb-8 text-center">
          URL Health Monitor
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <input
              type="text"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="Enter URLs (comma-separated, e.g., https://www.google.com, https://www.example.com)"
              className="w-3/4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-4 flex gap-4">
              <button
                onClick={checkUrls}
                disabled={loading}
                className="w-1/2 bg-[#3fe077] text-black py-2 rounded-lg hover:bg-[#34d764] disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check URLs'}
              </button>
              <button
                onClick={fetchAllUrls}
                disabled={loading}
                className="w-1/2 bg-[#3fe077] text-black py-2 rounded-lg hover:bg-[#34d764] disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Check Database'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Dynamically render the heading based on the source */}
          <h2 className="text-xl font-semibold mb-4">
            {source === 'database' ? 'URLs from Database' : source === 'searchBar' ? 'URLs from Search Bar' : ''}
          </h2>

          {results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Logo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      URL
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Response Time
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Uptime
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Last Checked
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      History
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {results.map((result) => (
                    <tr key={result.url} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 border border-gray-300">
                        {(() => {
                          let hostname = '';
                          try {
                            hostname = new URL(result.url).hostname;
                          } catch {
                            return <img src="/logo.png" alt="default logo" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />;
                          }

                          return (
                            <img
                              src={`https://logo.clearbit.com/${hostname}`}
                              alt="logo"
                              style={{ height: '40px', width: '40px', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/logo.png';
                              }}
                            />
                          );
                        })()}

                      </td>
                      <td className="px-4 py-4 whitespace-nowrap border border-gray-300">
                        <div className="text-sm text-gray-900">
                          {result.url}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap border border-gray-300 text-center">
                        <div className="flex items-center justify-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.status === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap border border-gray-300">
                        <div className="text-sm text-gray-900">
                          {result.response_time.toFixed(2)}s
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap border border-gray-300">
                        <div className="text-sm text-gray-900">
                          {result.uptime_percentage.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                        <div className="text-sm text-gray-900">
                          <div>{new Date(result.last_checked).toLocaleDateString()}</div> {/* Display date */}
                          <div>{new Date(result.last_checked).toLocaleTimeString()}</div> {/* Display time */}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border border-gray-300">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            viewHistory(result.url_id);
                          }}
                          className="text-[#3fe077] hover:text-[#34d764]"
                        >
                          {historyLoading && selectedUrlId === result.url_id ? 'Loading...' : 'View History'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {history.length > 0 && selectedUrlId !== null && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Check History</h2>
              <p className="text-gray-600 flex items-center flex justify-center mb-4">
                {(() => {
                  const result = results.find(r => r.url_id === selectedUrlId);
                  if (!result || !result.url) return <img src="/logo.png" alt="default logo" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />;

                  let hostname;
                  try {
                    hostname = new URL(result.url).hostname;
                  } catch {
                    return <img src="/logo.png" alt="default logo" style={{ height: '50px', width: '50px', objectFit: 'contain' }} />;
                  }

                  return (
                    <img
                      src={`https://logo.clearbit.com/${hostname}`}
                      alt="logo"
                      style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo.png';
                      }}
                    />
                  );
                })()}
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-black">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-black">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-black">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {history.map((check, index) => (
                      <tr key={index} className="hover:bg-gray-50 border border-black">
                        <td className="px-6 py-4 whitespace-nowrap border border-black">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            check.status === 'UP' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {check.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border border-black">
                          <div className="text-sm text-gray-900">
                            {check.response_time?.toFixed(2)}s
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border border-black">
                          <div className="text-sm text-gray-900">
                            {new Date(check.timestamp).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
