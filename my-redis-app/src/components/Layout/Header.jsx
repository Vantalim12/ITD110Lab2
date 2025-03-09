"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Header({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "DELETE",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl">Barangay Kabacsanan</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link
              href="/dashboard"
              className={`hover:text-indigo-200 ${
                pathname === "/dashboard" ? "font-semibold" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className={`hover:text-indigo-200 ${
                pathname.startsWith("/residents") ? "font-semibold" : ""
              }`}
            >
              Residents
            </Link>
            <Link
              href="/households"
              className={`hover:text-indigo-200 ${
                pathname.startsWith("/households") ? "font-semibold" : ""
              }`}
            >
              Households
            </Link>
            <Link
              href="/reports"
              className={`hover:text-indigo-200 ${
                pathname.startsWith("/reports") ? "font-semibold" : ""
              }`}
            >
              Reports
            </Link>
            <Link
              href="/search"
              className={`hover:text-indigo-200 ${
                pathname === "/search" ? "font-semibold" : ""
              }`}
            >
              Search
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`hover:text-indigo-200 ${
                  pathname.startsWith("/admin") ? "font-semibold" : ""
                }`}
              >
                Admin
              </Link>
            )}

            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-indigo-500">
              <span className="text-sm">
                {user?.fullName || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm rounded bg-white text-indigo-600 hover:bg-indigo-100"
              >
                Logout
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-2 pb-3 border-t border-indigo-500">
            <Link
              href="/dashboard"
              className={`block py-2 ${
                pathname === "/dashboard" ? "font-semibold" : ""
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/residents"
              className={`block py-2 ${
                pathname.startsWith("/residents") ? "font-semibold" : ""
              }`}
            >
              Residents
            </Link>
            <Link
              href="/households"
              className={`block py-2 ${
                pathname.startsWith("/households") ? "font-semibold" : ""
              }`}
            >
              Households
            </Link>
            <Link
              href="/reports"
              className={`block py-2 ${
                pathname.startsWith("/reports") ? "font-semibold" : ""
              }`}
            >
              Reports
            </Link>
            <Link
              href="/search"
              className={`block py-2 ${
                pathname === "/search" ? "font-semibold" : ""
              }`}
            >
              Search
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`block py-2 ${
                  pathname.startsWith("/admin") ? "font-semibold" : ""
                }`}
              >
                Admin
              </Link>
            )}

            <div className="pt-2 mt-2 border-t border-indigo-500">
              <span className="block py-2">
                {user?.fullName || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="block py-2 text-indigo-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
