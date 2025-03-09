// src/app/residents/[id]/page.js
import Layout from "@/components/Layout/Layout";
import ResidentDetail from "@/components/Residents/ResidentDetail";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Resident Details - Barangay Kabacsanan Information System",
  description: "View resident details in Barangay Kabacsanan",
};

export default function ResidentDetailPage({ params }) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return (
    <Layout>
      <div className="space-y-6">
        <ResidentDetail id={id} />
      </div>
    </Layout>
  );
}
