"use client";

import { useState, useEffect } from "react";

export default function StatisticsCards() {
  const [stats, setStats] = useState({
    residents: {
      total: 0,
      genderDistribution: {},
      ageGroups: {},
    },
    households: {
      total: 0,
      incomeGroups: {},
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch demographic stats
        const resResponse = await fetch("/api/residents?stats=true");
        const resData = await resResponse.json();

        // Fetch household stats
        const hhResponse = await fetch("/api/households?stats=true");
        const hhData = await hhResponse.json();

        setStats({
          residents: resData.stats,
          households: hhData.stats,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white p-6 rounded-lg shadow animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Residents",
      value: stats.residents.total || 0,
      description: "Registered residents in the barangay",
      color: "bg-blue-500",
    },
    {
      title: "Total Households",
      value: stats.households.totalHouseholds || 0,
      description: "Registered households in the barangay",
      color: "bg-green-500",
    },
    {
      title: "Average Household Size",
      value: (stats.households.averageHouseholdSize || 0).toFixed(1),
      description: "Average number of residents per household",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow border-l-4"
          style={{ borderLeftColor: card.color.replace("bg-", "") }}
        >
          <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
          <p className="text-3xl font-bold">{card.value}</p>
          <p className="text-gray-600 text-xs mt-1">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
