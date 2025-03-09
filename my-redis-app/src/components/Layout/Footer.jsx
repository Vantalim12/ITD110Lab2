import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800">
              Barangay Kabacsanan Information System
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Efficiently manage resident and household data
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              &copy; {currentYear} Barangay Kabacsanan. All rights reserved.
            </p>
            <p className="mt-1">Developed by the Digital Transformation Team</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
