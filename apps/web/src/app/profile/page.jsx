import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/auth/AuthProvider";
import useUser from "@/utils/useUser";
import useAuthHook from "@/utils/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import actualizeIcon from "../../../../../brand/actualizeLogoNBG.avif";
import actualizeArrowsIcon from "../../../../../brand/actualizeIconArrowsNBG.png";
import actualizeBoltIcon from "../../../../../brand/actualizeIconBoltNBG.png";

function ProfileContent() {
  const { loading } = useAuth();
  const { data: user, loading: userLoading } = useUser();
  const { signOut } = useAuthHook();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    fetchProfile();
  }, [loading]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/welcome" });
  };

  if (loading || userLoading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-brand-white">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-brand-white uppercase tracking-wide">
            Profile
          </h1>
          <p className="text-sm text-[#999] mt-1 font-body">
            Your wellness account
          </p>
        </div>

        {/* User Info Card */}
        <div className="card-brand text-center mb-5">
          <div className="w-20 h-20 rounded-full bg-brand-red flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-display font-bold text-brand-white">
              {getInitials(user?.email)}
            </span>
          </div>

          <h2 className="text-xl font-display font-semibold text-brand-white mb-2 uppercase tracking-wide">
            {profile?.profile?.fullName || user?.name || "Wellness User"}
          </h2>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-[#999] text-sm">✉</span>
            <span className="text-sm text-[#999] font-body">{user?.email}</span>
          </div>

          {profile?.profile?.memberSince && (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[#999] text-sm">📅</span>
              <span className="text-sm text-[#999] font-body">
                Member since {formatDate(profile.profile.memberSince)}
              </span>
            </div>
          )}
        </div>

        {/* Stats Header */}
        <h3 className="text-lg font-display font-semibold text-brand-white mb-4 uppercase tracking-wide">
          Wellness Stats
        </h3>

        {/* Stats Card */}
        <div className="card-brand mb-5">
          <div className="flex justify-around mb-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-red/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-2xl font-display font-bold text-brand-white">
                {profile?.stats?.totalAssessments || 0}
              </div>
              <div className="text-xs text-[#999] mt-1 font-body uppercase">Assessments</div>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-2xl font-display font-bold text-brand-white">
                {profile?.stats?.averageScore || 0}
              </div>
              <div className="text-xs text-[#999] mt-1 font-body uppercase">Avg Score</div>
            </div>
          </div>

          {profile?.stats?.bestDimension && (
            <div className="bg-surface-light rounded-xl p-4">
              <div className="text-sm text-[#999] mb-1 font-body">Your Best Dimension</div>
              <div className="text-lg font-display font-semibold text-brand-lime uppercase tracking-wide">
                {profile.stats.bestDimension}
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-surface border border-surface-light hover:border-[#ef4444] text-[#ef4444] rounded-2xl py-4 px-5 font-display font-semibold text-base flex items-center justify-center gap-3 transition-colors uppercase tracking-wide"
        >
          <span>🚪</span>
          Sign Out
        </button>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light px-4 py-3">
          <div className="max-w-2xl mx-auto flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#999] hover:text-brand-white">
              <img src={actualizeIcon} alt="Home" className="w-9 h-9" />
              <span className="text-xs font-body">Home</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-1 text-[#999] hover:text-brand-white">
              <img src={actualizeArrowsIcon} alt="History" className="w-12 h-12" />
              <span className="text-xs font-body">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-brand-red">
              <img src={actualizeBoltIcon} alt="Profile" className="w-12 h-12" />
              <span className="text-xs font-body">Profile</span>
            </Link>
          </div>
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute to require authentication
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
