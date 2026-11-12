"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  school: string;
  role: string;
};

type SettingsTabProps = {
  profile: Profile;
};

export default function SettingsTab({ profile }: SettingsTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    school: profile.school,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          school: formData.school,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name,
      school: profile.school,
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const supabase = createClient();
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setPasswordSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Settings Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-[#E3B23C] to-[#C9962A] rounded-full" />
          <h2 className="text-2xl font-bold text-[#2E2815]">Settings</h2>
        </div>
        <p className="text-sm text-[#8B7E6A] ml-4">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <p className="text-red-700 text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <p className="text-green-700 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#2E2815]">Profile Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E3B23C] hover:bg-[#D4A02C] text-[#2E2815] font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
                placeholder="Your full name"
              />
            ) : (
              <div className="px-4 py-3 bg-[#FFFDF5] border-2 border-[#E3B23C]/30 rounded-lg">
                <p className="text-[#2E2815] font-medium">{profile.full_name}</p>
              </div>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-2">
              Email Address
            </label>
            <div className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg">
              <p className="text-gray-600 font-medium">{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-2">
              School
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
                placeholder="Your school name"
              />
            ) : (
              <div className="px-4 py-3 bg-[#FFFDF5] border-2 border-[#E3B23C]/30 rounded-lg">
                <p className="text-[#2E2815] font-medium">{profile.school}</p>
              </div>
            )}
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-2">
              Role
            </label>
            <div className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg">
              <p className="text-gray-600 font-medium capitalize">{profile.role}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <h3 className="text-xl font-bold text-[#2E2815] mb-4">Change Password</h3>
        
        {/* Password Messages */}
        {passwordError && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm font-semibold">{passwordError}</p>
          </div>
        )}

        {passwordSuccess && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
            <p className="text-green-700 text-sm font-semibold">{passwordSuccess}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-[#2E2815] mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#E3B23C] focus:outline-none"
              placeholder="Confirm new password"
            />
          </div>

          {/* Change Password Button */}
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-full bg-[#E3B23C] hover:bg-[#D4A02C] text-[#2E2815] font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isChangingPassword ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating Password...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Update Password
              </>
            )}
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
        <h3 className="text-xl font-bold text-[#2E2815] mb-4">Account Actions</h3>
        
        <div className="space-y-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-lg transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-red-900">Logout</p>
                <p className="text-xs text-red-700">Sign out of your account</p>
              </div>
            </div>
            {isLoggingOut && (
              <svg className="w-5 h-5 animate-spin text-red-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
