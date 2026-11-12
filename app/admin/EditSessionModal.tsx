"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSession } from "./actions";

type Teacher = {
  id: string;
  full_name: string;
  school: string | null;
};

type Session = {
  id: string;
  session_id: string;
  session_no: number;
  session_date: string;
  title: string;
  region: string;
  division: string;
  locked: boolean;
  send_to_all: boolean;
  assigned_teachers: string[];
};

type EditSessionModalProps = {
  session: Session;
  teachers: Teacher[];
  onClose: () => void;
};

export default function EditSessionModal({
  session,
  teachers,
  onClose,
}: EditSessionModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sendToAll, setSendToAll] = useState(session.send_to_all);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(
    new Set(session.assigned_teachers || [])
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set("session_id", session.id);
    formData.set("send_to_all", sendToAll.toString());
    if (!sendToAll) {
      formData.set("assigned_teachers", Array.from(selectedTeachers).join(","));
    }

    try {
      await updateSession(formData);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeachers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const selectAllTeachers = () => {
    setSelectedTeachers(new Set(filteredTeachers.map((t) => t.id)));
  };

  const deselectAllTeachers = () => {
    setSelectedTeachers(new Set());
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.school && teacher.school.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-gradient-to-r from-[#E3B23C] via-[#F3DC94] to-[#E3B23C] px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#2E2815]">Edit LAC Session</h3>
            <button
              onClick={onClose}
              className="text-[#2E2815]/70 hover:text-[#2E2815] p-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2E2815] mb-2">
                  Session ID *
                </label>
                <input
                  type="text"
                  name="session_id_display"
                  defaultValue={session.session_id}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-[#8B7E6A] mt-1">Cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2E2815] mb-2">
                  Session Number *
                </label>
                <input
                  type="number"
                  name="session_no"
                  required
                  min="1"
                  defaultValue={session.session_no}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2E2815] mb-2">
                Session Date *
              </label>
              <input
                type="date"
                name="session_date"
                required
                defaultValue={session.session_date}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2E2815] mb-2">
                Session Title *
              </label>
              <input
                type="text"
                name="title"
                required
                defaultValue={session.title}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#2E2815] mb-2">
                  Region *
                </label>
                <input
                  type="text"
                  name="region"
                  required
                  defaultValue={session.region}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2E2815] mb-2">
                  Division *
                </label>
                <input
                  type="text"
                  name="division"
                  required
                  defaultValue={session.division}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none focus:ring-2 focus:ring-[#E3B23C]/20 transition-all"
                />
              </div>
            </div>

            {/* Teacher Assignment Section */}
            <div className="border-t-2 border-gray-200 pt-5">
              <label className="block text-sm font-semibold text-[#2E2815] mb-3">
                Send to Teachers *
              </label>

              {/* Send to All Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-[#E3B23C] transition-colors">
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => {
                      setSendToAll(e.target.checked);
                      if (e.target.checked) {
                        setSelectedTeachers(new Set());
                      }
                    }}
                    className="w-5 h-5 text-[#E3B23C] rounded focus:ring-[#E3B23C]"
                  />
                  <div>
                    <div className="font-semibold text-[#2E2815]">
                      Send to All Active Teachers
                    </div>
                    <div className="text-xs text-[#8B7E6A]">
                      All {teachers.length} active teachers will receive this session
                    </div>
                  </div>
                </label>
              </div>

              {/* Specific Teacher Selection */}
              {!sendToAll && (
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-[#2E2815]">
                      Select Specific Teachers ({selectedTeachers.size} selected)
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selectAllTeachers}
                        className="text-xs px-2 py-1 bg-[#E3B23C] hover:bg-[#D4A02C] text-[#2E2815] rounded font-semibold transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllTeachers}
                        className="text-xs px-2 py-1 bg-gray-300 hover:bg-gray-400 text-[#2E2815] rounded font-semibold transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search teachers..."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-[#E3B23C] focus:outline-none"
                    />
                  </div>

                  {/* Teacher List */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredTeachers.length === 0 ? (
                      <p className="text-sm text-[#8B7E6A] text-center py-4">
                        {searchQuery ? "No teachers found" : "No active teachers available"}
                      </p>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <label
                          key={teacher.id}
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-[#E3B23C] hover:shadow-sm transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeachers.has(teacher.id)}
                            onChange={() => toggleTeacher(teacher.id)}
                            className="w-4 h-4 text-[#E3B23C] rounded focus:ring-[#E3B23C]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#2E2815] truncate">
                              {teacher.full_name}
                            </div>
                            {teacher.school && (
                              <div className="text-xs text-[#8B7E6A] truncate">
                                {teacher.school}
                              </div>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#E3B23C] hover:bg-[#C9962A] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Session"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
