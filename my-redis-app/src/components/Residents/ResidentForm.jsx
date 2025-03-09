"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResidentForm({
  resident,
  households,
  mode = "create",
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    civilStatus: "",
    occupation: "",
    contactNumber: "",
    email: "",
    householdId: "",
    isHead: false,
    categoryTags: [],
    ...resident,
  });

  const [customTag, setCustomTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableHouseholds, setAvailableHouseholds] = useState(
    households || []
  );

  // Fetch households if not provided
  useEffect(() => {
    if (!households) {
      const fetchHouseholds = async () => {
        try {
          const response = await fetch("/api/households");
          const data = await response.json();
          setAvailableHouseholds(data.households || []);
        } catch (error) {
          console.error("Error fetching households:", error);
        }
      };

      fetchHouseholds();
    }
  }, [households]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddTag = () => {
    if (customTag.trim() && !formData.categoryTags.includes(customTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        categoryTags: [...prev.categoryTags, customTag.trim()],
      }));
      setCustomTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      categoryTags: prev.categoryTags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;

      if (mode === "create") {
        response = await fetch("/api/residents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`/api/residents/${resident.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save resident");
      }

      // Redirect back to residents list
      router.push("/residents");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        {mode === "create" ? "Add New Resident" : "Edit Resident"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium mb-4 border-b pb-2">
            Personal Information
          </h3>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Middle Name
            </label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Birth Date
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Civil Status
            </label>
            <select
              name="civilStatus"
              value={formData.civilStatus}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
        </div>

        {/* Contact & Household Info */}
        <div>
          <h3 className="text-lg font-medium mb-4 border-b pb-2">
            Contact & Household
          </h3>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Household
            </label>
            <select
              name="householdId"
              value={formData.householdId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Household</option>
              {availableHouseholds.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.addressLine1}, {household.addressLine2}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isHead"
                checked={formData.isHead}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm font-bold">
                Household Head
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Category Tags
            </label>
            <div className="flex">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Add tag (e.g., Senior, PWD)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
              >
                Add
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {formData.categoryTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Add Resident"
            : "Update Resident"}
        </button>
      </div>
    </form>
  );
}
