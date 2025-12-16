import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSession } from "@auth/create/react";
import useUser from "@/utils/useUser";
import useAuth from "@/utils/useAuth";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { data: user, loading: userLoading } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      navigate("/account/signin?callbackUrl=/profile");
      return;
    }
    fetchProfile();
  }, [session, status, navigate]);

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
      setLoading(false);
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#d90428] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white font-montserrat">
            Profile
          </h1>
          <p className="text-sm text-[#999] mt-1 font-montserrat">
            Your wellness account
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-5 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d90428] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-semibold text-white font-montserrat">
              {getInitials(user?.email)}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-white mb-2 font-montserrat">
            {profile?.profile?.fullName || user?.name || "Wellness User"}
          </h2>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-[#999] text-sm">✉</span>
            <span className="text-sm text-[#999] font-montserrat">{user?.email}</span>
          </div>

          {profile?.profile?.memberSince && (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[#999] text-sm">📅</span>
              <span className="text-sm text-[#999] font-montserrat">
                Member since {formatDate(profile.profile.memberSince)}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <h3 className="text-base font-semibold text-white mb-4 font-montserrat">
          Wellness Stats
        </h3>

        <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-5">
          <div className="flex justify-around mb-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#d90428]/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-2xl font-semibold text-white font-montserrat">
                {profile?.stats?.totalAssessments || 0}
              </div>
              <div className="text-xs text-[#999] mt-1 font-montserrat">Assessments</div>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-2xl font-semibold text-white font-montserrat">
                {profile?.stats?.averageScore || 0}
              </div>
              <div className="text-xs text-[#999] mt-1 font-montserrat">Avg Score</div>
            </div>
          </div>

          {profile?.stats?.bestDimension && (
            <div className="bg-[#222] rounded-xl p-4">
              <div className="text-sm text-[#999] mb-1 font-montserrat">Your Best Dimension</div>
              <div className="text-lg font-semibold text-white font-montserrat">
                {profile.stats.bestDimension}
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full bg-[#1a1a1a] border border-[#333] hover:border-[#555] text-[#ef4444] rounded-2xl py-4 px-5 font-semibold text-base flex items-center justify-center gap-3 transition-colors"
        >
          <span>🚪</span>
          Sign Out
        </button>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] px-4 py-3">
          <div className="max-w-2xl mx-auto flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 text-[#999] hover:text-white">
              <span className="text-xl">🏠</span>
              <span className="text-xs font-montserrat">Home</span>
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-1 text-[#999] hover:text-white">
              <span className="text-xl">📊</span>
              <span className="text-xs font-montserrat">History</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 text-[#d90428]">
              <span className="text-xl">👤</span>
              <span className="text-xs font-montserrat">Profile</span>
            </Link>
          </div>
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}

