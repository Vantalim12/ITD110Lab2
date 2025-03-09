// src/app/residents/page.js
import Layout from "@/components/Layout/Layout";
import ResidentList from "@/components/Residents/ResidentList";
import Link from "next/link";

export const metadata = {
  title: "Residents - Barangay Kabacsanan Information System",
  description: "Manage residents in Barangay Kabacsanan",
};

export default function ResidentsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Residents</h1>
          <Link
            href="/residents/add"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
          >
            Add New Resident
          </Link>
        </div>

        <ResidentList />
      </div>
    </Layout>
  );
}
