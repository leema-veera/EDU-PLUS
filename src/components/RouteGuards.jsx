import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function AuthLoading() {
  return (
    <main className="page-state" role="status" aria-live="polite">
      Checking your session…
    </main>
  );
}

function AuthVerificationError({ message }) {
  const { logout } = useAuth();
  const [logoutError, setLogoutError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    setLogoutError("");
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message || "Unable to sign out.");
      setSigningOut(false);
    }
  }

  return (
    <main className="page-state" role="alert">
      <h1>Unable to verify access</h1>
      <p>{message}</p>
      {logoutError && <p className="error-message">{logoutError}</p>}
      <button type="button" onClick={handleSignOut} disabled={signingOut}>
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </main>
  );
}

export function RequireRole({ allowedRoles }) {
  const { user, role, loading, error, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoading />;
  }
  if (error) {
    return <AuthVerificationError message={error} />;
  }
  if (!user || !session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <Outlet />;
}

export function RedirectAuthenticatedUser() {
  const { user, role, loading, error, session } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }
  if (session && error) {
    return <AuthVerificationError message={error} />;
  }
  if (user && role) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <Outlet />;
}
