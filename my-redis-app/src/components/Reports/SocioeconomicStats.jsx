"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SocioeconomicStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState("income"); // income, householdSize

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/households?stats=true");

        if (!response.ok) {
          throw new Error("Failed to fetch household data");
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

  const prepareIncomeData = () => {
    if (!stats || !stats.incomeGroups) return [];

    return Object.entries(stats.incomeGroups).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  const prepareHouseholdSizeData = () => {
    if (!stats || !stats.householdSizeDistribution) return [];

    return Object.entries(stats.householdSizeDistribution).map(
      ([size, count]) => ({
        name: size,
        value: count,
      })
    );
  };

  // Colors for the charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow min-h-[400px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Socioeconomic Data</h2>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Socioeconomic Data</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveChart("income")}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === "income"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Income Groups
          </button>
          <button
            onClick={() => setActiveChart("householdSize")}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === "householdSize"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Household Size
          </button>
        </div>
      </div>

      <div className="h-80">
        {stats && (
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === "income" ? (
              <BarChart
                data={prepareIncomeData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Households" fill="#22C55E" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={prepareHouseholdSizeData()}
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
                  {prepareHouseholdSizeData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} households`, "Count"]}
                />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalHouseholds || 0}
            </div>
            <div className="text-sm text-gray-500">Total Households</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalResidents || 0}
            </div>
            <div className="text-sm text-gray-500">Total Residents</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-2xl font-bold text-green-600">
              {stats.averageHouseholdSize
                ? stats.averageHouseholdSize.toFixed(1)
                : "0"}
            </div>
            <div className="text-sm text-gray-500">Avg. Household Size</div>
          </div>
        </div>
      )}
    </div>
  );
}
