import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { loginUser } from "../services/authService";

export default function LoginPage() {
  const { error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await loginUser(email.trim(), password);
      if (!result.success) {
        setError(result.error.message);
      }
    } catch (loginError) {
      setError(loginError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">EDU PLUS</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in with an account created for this EDU PLUS Supabase project.</p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {(error || authError) && (
          <div className="login-error" role="alert">
            <p className="error-message">{error || authError}</p>
            <p className="muted">
              If you do not have an account yet, contact your EDU PLUS administrator.
            </p>
          </div>
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
