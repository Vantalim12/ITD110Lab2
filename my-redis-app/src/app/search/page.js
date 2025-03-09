// src/app/search/page.js
import Layout from "@/components/Layout/Layout";
import SearchBar from "@/components/Search/SearchBar";

export const metadata = {
  title: "Search - Barangay Kabacsanan Information System",
  description: "Search residents and households in Barangay Kabacsanan",
};

export default function SearchPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Search</h1>
        </div>

        <SearchBar />
      </div>
    </Layout>
  );
}
