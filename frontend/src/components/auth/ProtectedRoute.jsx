import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentAdmin } from "../../lib/auth.js";

/**
 * Route guard for admin-only pages.
 *
 * Because the JWT lives in an httpOnly cookie (unreadable from JS), the guard
 * verifies the session with the backend (`/auth/me`). While the check is in
 * flight it renders nothing; on failure it redirects to the login page.
 */
export default function ProtectedRoute({ children }) {
  // "checking" | "authed" | "unauthed"
  const [state, setState] = useState("checking");

  useEffect(() => {
    let active = true;
    getCurrentAdmin()
      .then((admin) => {
        if (active) setState(admin ? "authed" : "unauthed");
      })
      .catch(() => {
        // Treat network/unexpected errors as unauthenticated.
        if (active) setState("unauthed");
      });
    return () => {
      active = false;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-stone">
        Se verifică sesiunea…
      </div>
    );
  }

  if (state === "unauthed") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
