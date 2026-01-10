import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";

export default function Page() {
  const { isLoaded, isSignedIn } = useAuth();
  const loading = !isLoaded;
  const user = isSignedIn;
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/welcome");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return null;
}
