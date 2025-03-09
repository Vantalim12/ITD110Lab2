"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DemographicChart() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState("age"); // age, gender, civilStatus

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/residents?stats=true");

        if (!response.ok) {
          throw new Error("Failed to fetch demographic data");
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const prepareAgeData = () => {
    if (!stats || !stats.ageGroups) return [];

    return Object.entries(stats.ageGroups).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  const prepareGenderData = () => {
    if (!stats || !stats.genderDistribution) return [];

    return Object.entries(stats.genderDistribution).map(([gender, count]) => ({
      name: gender,
      value: count,
    }));
  };

  const prepareCivilStatusData = () => {
    if (!stats || !stats.civilStatusDistribution) return [];

    return Object.entries(stats.civilStatusDistribution).map(
      ([status, count]) => ({
        name: status,
        value: count,
      })
    );
  };

  // Colors for the charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow min-h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Demographic Data</h2>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Demographic Data</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveChart("age")}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === "age"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Age Groups
          </button>
          <button
            onClick={() => setActiveChart("gender")}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === "gender"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Gender
          </button>
          <button
            onClick={() => setActiveChart("civilStatus")}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === "civilStatus"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Civil Status
          </button>
        </div>
      </div>

      <div className="h-80">
        {stats && (
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === "age" ? (
              <BarChart
                data={prepareAgeData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Residents" fill="#4F46E5" />
              </BarChart>
            ) : activeChart === "gender" ? (
              <PieChart>
                <Pie
                  data={prepareGenderData()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {prepareGenderData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} residents`, "Count"]}
                />
                <Legend />
              </PieChart>
            ) : (
              <BarChart
                data={prepareCivilStatusData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Residents" fill="#22C55E" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.total || 0}
            </div>
            <div className="text-sm text-gray-500">Total Residents</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.genderDistribution?.Male || 0}
            </div>
            <div className="text-sm text-gray-500">Male</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.genderDistribution?.Female || 0}
            </div>
            <div className="text-sm text-gray-500">Female</div>
          </div>
        </div>
      )}
    </div>
  );
}
