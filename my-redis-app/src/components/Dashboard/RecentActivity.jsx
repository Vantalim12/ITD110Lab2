"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Fetch latest residents
        const resResponse = await fetch("/api/residents?page=1&limit=5");
        const resData = await resResponse.json();

        // Fetch latest households
        const hhResponse = await fetch("/api/households?page=1&limit=5");
        const hhData = await hhResponse.json();

        // Combine and sort by create date
        const recentResidents = resData.residents.map((resident) => ({
          id: resident.id,
          type: "resident",
          name: `${resident.firstName} ${resident.lastName}`,
          date: new Date(resident.createdAt),
          action: "added",
        }));

        const recentHouseholds = hhData.households.map((household) => ({
          id: household.id,
          type: "household",
          name: `${household.addressLine1}`,
          date: new Date(household.createdAt),
          action: "added",
        }));

        const combined = [...recentResidents, ...recentHouseholds]
          .sort((a, b) => b.date - a.date)
          .slice(0, 10);

        setActivities(combined);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">Recent Activity</h2>

      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent activities</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 pb-3 border-b"
            >
              <div
                className={`p-2 rounded-full ${
                  activity.type === "resident"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {activity.type === "resident" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">
                    <Link
                      href={`/${activity.type}s/${activity.id}`}
                      className="hover:text-indigo-600"
                    >
                      {activity.name}
                    </Link>
                  </h3>
                  <span className="text-sm text-gray-500">
                    {activity.date.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {activity.type === "resident"
                    ? "New resident"
                    : "New household"}{" "}
                  {activity.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <Link
          href={"/residents"}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          View All Residents
        </Link>
        <span className="mx-2 text-gray-300">|</span>
        <Link
          href={"/households"}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          View All Households
        </Link>
      </div>
    </div>
  );
}
