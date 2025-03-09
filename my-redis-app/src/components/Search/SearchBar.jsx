"use client";

import { useState } from "react";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Search failed. Please try again.");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, address, tag, etc."
            className="flex-1 border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            disabled={loading || !query.trim()}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="mt-2 text-sm text-gray-500">
          <p>
            Search for residents by name, household by address, or any data
            tagged with specific categories.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-6">
          {/* Residents Results */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-indigo-50 border-b">
              <h2 className="text-lg font-medium">
                Residents{" "}
                <span className="text-indigo-600">
                  ({results.residents ? results.residents.length : 0})
                </span>
              </h2>
            </div>

            {results.residents && results.residents.length > 0 ? (
              <div className="divide-y">
                {results.residents.map((resident) => (
                  <div key={resident.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/residents/${resident.id}`}
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          {resident.firstName} {resident.lastName}
                        </Link>
                        <p className="text-gray-600 text-sm">
                          {resident.gender}, {resident.civilStatus}
                          {resident.occupation && `, ${resident.occupation}`}
                        </p>
                        {resident.isHead && (
                          <span className="inline-block mt-1 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Household Head
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/residents/${resident.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        View Details
                      </Link>
                    </div>

                    {resident.categoryTags &&
                      resident.categoryTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {resident.categoryTags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No residents found matching your search criteria.
              </div>
            )}
          </div>

          {/* Households Results */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b">
              <h2 className="text-lg font-medium">
                Households{" "}
                <span className="text-green-600">
                  ({results.households ? results.households.length : 0})
                </span>
              </h2>
            </div>

            {results.households && results.households.length > 0 ? (
              <div className="divide-y">
                {results.households.map((household) => (
                  <div key={household.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/households/${household.id}`}
                          className="text-lg font-medium text-green-600 hover:text-green-800"
                        >
                          {household.addressLine1}
                          {household.addressLine2 &&
                            `, ${household.addressLine2}`}
                        </Link>
                        <p className="text-gray-600 text-sm">
                          {household.barangay}, {household.city},{" "}
                          {household.province}
                        </p>
                      </div>
                      <Link
                        href={`/households/${household.id}`}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        View Details
                      </Link>
                    </div>

                    {household.categoryTags &&
                      household.categoryTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {household.categoryTags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No households found matching your search criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Search the Database
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Use the search bar above to find residents, households, and specific
            data categories across the entire database.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link
              href="/residents"
              className="text-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Browse All Residents
            </Link>
            <Link
              href="/households"
              className="text-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
            >
              Browse All Households
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
