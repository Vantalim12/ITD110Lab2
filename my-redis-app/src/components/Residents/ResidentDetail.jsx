"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResidentDetail({ id }) {
  const router = useRouter();
  const [resident, setResident] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchResident = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/residents/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Resident not found");
          }
          throw new Error("Failed to fetch resident");
        }

        const data = await response.json();
        setResident(data.resident);

        // Fetch household data if available
        if (data.resident.householdId) {
          const hhResponse = await fetch(
            `/api/households/${data.resident.householdId}`
          );
          if (hhResponse.ok) {
            const hhData = await hhResponse.json();
            setHousehold(hhData.household);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResident();
  }, [id]);

  const calculateAge = (birthdate) => {
    if (!birthdate) return "N/A";
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/residents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resident");
      }

      router.push("/residents");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-500">{error}</p>
        <Link href="/residents" className="text-indigo-600 mt-2 inline-block">
          Back to Residents
        </Link>
      </div>
    );
  }

  if (!resident) {
    return <div>Resident not found</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {resident.firstName}{" "}
            {resident.middleName ? resident.middleName + " " : ""}
            {resident.lastName}
          </h1>
          <p className="text-gray-500">Resident ID: {resident.id}</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/residents/${id}/edit`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
          >
            Edit Resident
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-4 border-b pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Full Name</div>
                <div className="col-span-2 font-medium">
                  {resident.firstName} {resident.middleName || ""}{" "}
                  {resident.lastName}
                </div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Age</div>
                <div className="col-span-2">
                  {calculateAge(resident.birthDate)} years
                </div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Birth Date</div>
                <div className="col-span-2">
                  {resident.birthDate
                    ? new Date(resident.birthDate).toLocaleDateString()
                    : "Not specified"}
                </div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Gender</div>
                <div className="col-span-2">{resident.gender}</div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Civil Status</div>
                <div className="col-span-2">{resident.civilStatus}</div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Occupation</div>
                <div className="col-span-2">
                  {resident.occupation || "Not specified"}
                </div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Categories</div>
                <div className="col-span-2">
                  {resident.categoryTags && resident.categoryTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {resident.categoryTags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "None"
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4 border-b pb-2">
                Contact & Household
              </h2>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Contact Number</div>
                <div className="col-span-2">
                  {resident.contactNumber || "Not provided"}
                </div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Email</div>
                <div className="col-span-2">
                  {resident.email || "Not provided"}
                </div>
              </div>

              <div className="grid grid-cols-3 mb-3">
                <div className="text-gray-500">Household Role</div>
                <div className="col-span-2">
                  {resident.isHead ? (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Household Head
                    </span>
                  ) : (
                    "Member"
                  )}
                </div>
              </div>

              {household && (
                <>
                  <div className="grid grid-cols-3 mb-3">
                    <div className="text-gray-500">Address</div>
                    <div className="col-span-2">
                      {household.addressLine1}
                      {household.addressLine2 && (
                        <>, {household.addressLine2}</>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 mb-3">
                    <div className="text-gray-500">Barangay</div>
                    <div className="col-span-2">{household.barangay}</div>
                  </div>

                  <div className="grid grid-cols-3 mb-3">
                    <div className="text-gray-500">City/Province</div>
                    <div className="col-span-2">
                      {household.city}, {household.province}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/households/${household.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Full Household Details →
                    </Link>
                  </div>
                </>
              )}

              {!household && resident.householdId && (
                <div className="p-4 bg-yellow-50 rounded-md mt-2">
                  <p className="text-yellow-700">
                    Household information is currently unavailable.
                  </p>
                </div>
              )}

              {!resident.householdId && (
                <div className="p-4 bg-red-50 rounded-md mt-2">
                  <p className="text-red-700">
                    This resident is not assigned to any household.
                  </p>
                  <Link
                    href={`/residents/${id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900 mt-2 inline-block"
                  >
                    Assign to a Household
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t pt-4">
            <h2 className="text-lg font-medium mb-2">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  Created: {new Date(resident.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Last Updated: {new Date(resident.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete {resident.firstName}{" "}
              {resident.lastName}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
