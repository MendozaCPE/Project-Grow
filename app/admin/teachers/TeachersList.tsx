"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleTeacherActive } from "../actions";

type Teacher = {
  id: string;
  full_name: string;
  school: string;
  email: string;
  active: boolean;
  created_at: string;
};

type TeachersListProps = {
  teachers: Teacher[];
};

export default function TeachersList({ teachers }: TeachersListProps) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  if (teachers.length === 0) {
    return (
      <div className="bg-[#FFFDF5] rounded-lg shadow-md p-6 sm:p-8 text-center">
        <div className="text-[#2E2815]/40 mb-2">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#2E2815] mb-2">
          No Teachers Found
        </h3>
        <p className="text-sm text-[#2E2815]/70">
          No teachers match your search criteria.
        </p>
      </div>
    );
  }

  const handleToggleActive = async (teacherId: string, currentActive: boolean) => {
    if (
      !confirm(
        `Are you sure you want to ${
          currentActive ? "deactivate" : "reactivate"
        } this teacher? ${
          currentActive
            ? "They will not be able to log in, but their forms will remain intact."
            : "They will be able to log in again."
        }`
      )
    ) {
      return;
    }

    setTogglingId(teacherId);
    try {
      await toggleTeacherActive(teacherId, !currentActive);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle active:", error);
      alert("Failed to update teacher status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Desktop: Table View */}
      <div className="hidden lg:block bg-[#FFFDF5] rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#E3B23C]/20">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Name
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                School
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Email
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Status
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-[#2E2815]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className={`border-t border-gray-200 ${
                  !teacher.active ? "bg-red-50" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm text-[#2E2815] font-medium">
                  {teacher.full_name}
                </td>
                <td className="px-4 py-3 text-sm text-[#2E2815]/70">
                  {teacher.school}
                </td>
                <td className="px-4 py-3 text-sm text-[#2E2815]/70">
                  {teacher.email}
                </td>
                <td className="px-4 py-3">
                  {teacher.active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleToggleActive(teacher.id, teacher.active)}
                    disabled={togglingId === teacher.id}
                    className={`${
                      teacher.active
                        ? "bg-red-100 hover:bg-red-200 text-red-700"
                        : "bg-green-100 hover:bg-green-200 text-green-700"
                    } font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50`}
                  >
                    {togglingId === teacher.id
                      ? "Updating..."
                      : teacher.active
                      ? "Deactivate"
                      : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet: Card View */}
      <div className="lg:hidden space-y-3">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className={`bg-[#FFFDF5] rounded-lg shadow-md p-4 ${
              !teacher.active ? "border-2 border-red-300" : ""
            }`}
          >
            <div className="mb-3">
              <h3 className="text-base font-semibold text-[#2E2815] mb-1">
                {teacher.full_name}
              </h3>
              <p className="text-sm text-[#2E2815]/70 mb-1">
                {teacher.school}
              </p>
              <p className="text-sm text-[#2E2815]/70 mb-2">{teacher.email}</p>
              <div>
                {teacher.active ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleToggleActive(teacher.id, teacher.active)}
              disabled={togglingId === teacher.id}
              className={`w-full ${
                teacher.active
                  ? "bg-red-100 hover:bg-red-200 text-red-700"
                  : "bg-green-100 hover:bg-green-200 text-green-700"
              } font-semibold py-3 px-4 rounded-lg transition-colors min-h-[48px] disabled:opacity-50`}
            >
              {togglingId === teacher.id
                ? "Updating..."
                : teacher.active
                ? "Deactivate Teacher"
                : "Reactivate Teacher"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
