import { useState } from "react";
import { useAuth } from "../auth/useAuth";

const TITLES = {
  student: "Student portal",
  staff: "Staff & mentor portal",
  admin: "Administration",
};

export default function RoleHomePage({ role }) {
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setError("");
    setLoggingOut(true);
    try {
      await logout();
    } catch (logoutError) {
      setError(logoutError.message || "Unable to log out.");
      setLoggingOut(false);
    }
  }

  return (
    <main className="portal-shell">
      <header className="portal-header">
        <div>
          <p className="eyebrow">EDU PLUS</p>
          <h1>{TITLES[role]}</h1>
        </div>
        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </header>
      <section className="portal-card">
        <h2>Signed in</h2>
        <p>{user?.email}</p>
        <p className="muted">Access is based on your account role.</p>
      </section>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
