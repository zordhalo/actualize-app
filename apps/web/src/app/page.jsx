import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSession } from "@auth/create/react";

export default function Page() {
  const { data: session, status } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "loading") return;
    
    if (session?.user) {
      navigate("/dashboard");
    } else {
      navigate("/welcome");
    }
  }, [session, status, navigate]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return null;
}
