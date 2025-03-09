"use client";

import { useState, useEffect } from "react";

export default function RedisManager() {
  const [data, setData] = useState({});
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      });

      // Refresh data
      fetchData();

      // Reset form
      setKey("");
      setValue("");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Redis Manager</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label
            htmlFor="key"
            className="block text-sm font-medium text-gray-700"
          >
            Key
          </label>
          <input
            type="text"
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="value"
            className="block text-sm font-medium text-gray-700"
          >
            Value
          </label>
          <input
            type="text"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save
        </button>
      </form>

      <div>
        <h3 className="text-lg font-medium mb-2">Stored Data</h3>
        {loading ? (
          <p>Loading...</p>
        ) : Object.keys(data).length === 0 ? (
          <p>No data available</p>
        ) : (
          <ul className="border rounded-md divide-y">
            {Object.entries(data).map(([k, v]) => (
              <li key={k} className="p-3">
                <span className="font-medium">{k}:</span> {v}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
