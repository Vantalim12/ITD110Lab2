// src/app/reports/page.js
import Layout from "@/components/Layout/Layout";
import DemographicChart from "@/components/Reports/DemographicChart";
import SocioeconomicStats from "@/components/Reports/SocioeconomicStats";

export const metadata = {
  title: "Reports - Barangay Kabacsanan Information System",
  description: "Data analytics and reports for Barangay Kabacsanan",
};

export default function ReportsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DemographicChart />
          <SocioeconomicStats />
        </div>
      </div>
    </Layout>
  );
}
