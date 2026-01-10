import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

/**
 * Legacy sign-up page - redirects to new Clerk sign-up
 */
export default function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get callback URL from query params
    const params = new URLSearchParams(location.search);
    const callbackUrl = params.get('callbackUrl') || '/welcome';
    
    // Redirect to new Clerk sign-up route
    navigate(`/sign-up?redirect_url=${encodeURIComponent(callbackUrl)}`, { replace: true });
  }, [navigate, location]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-starry p-4">
      <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
