"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "./Header";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check on the login page
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user");

        if (!response.ok) {
          throw new Error("Not authenticated");
        }

        const data = await response.json();
        setUser(data.user);
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        // Redirect to login if not authenticated
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Don't show layout on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-indigo-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
      <footer className="bg-gray-100 border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Barangay Kabacsanan. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
