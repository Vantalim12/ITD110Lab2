// src/app/residents/add/page.js
import Layout from "@/components/Layout/Layout";
import ResidentForm from "@/components/Residents/ResidentForm";

export const metadata = {
  title: "Add Resident - Barangay Kabacsanan Information System",
  description: "Add a new resident to Barangay Kabacsanan",
};

export default function AddResidentPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Add New Resident</h1>
        </div>

        <ResidentForm mode="create" />
      </div>
    </Layout>
  );
}
