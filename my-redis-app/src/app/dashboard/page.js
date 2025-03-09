// src/app/dashboard/page.js
import Layout from "@/components/Layout/Layout";
import StatisticsCards from "@/components/Dashboard/StatisticsCards";
import RecentActivity from "@/components/Dashboard/RecentActivity";

export const metadata = {
  title: "Dashboard - Barangay Kabacsanan Information System",
  description: "Monitor and manage barangay residents and households data",
};

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">
            Welcome to Barangay Kabacsanan Information System
          </p>
        </div>

        <StatisticsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <RecentActivity />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href="/residents/add"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-2"
              >
                Add New Resident
              </a>
              <a
                href="/households/add"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2"
              >
                Add New Household
              </a>
              <a
                href="/search"
                className="block w-full text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Search Database
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
