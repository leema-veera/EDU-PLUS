import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { getCurrentUser, logoutUser, onAuthStateChange } from "../services/authService";
import { getCurrentRole } from "../services/roleService";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setUser(null);
      setRole(null);
      setError("");
      setLoading(Boolean(nextSession));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!session) {
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const userResult = await getCurrentUser();
        if (!userResult.success) {
          throw new Error(userResult.error.message);
        }
        if (!userResult.data) {
          throw new Error("Your session is no longer valid. Please sign in again.");
        }
        const roleResult = await getCurrentRole();
        if (!roleResult.success) {
          throw new Error(roleResult.error.message);
        }

        if (active) {
          setUser(userResult.data);
          setRole(roleResult.data);
          setLoading(false);
        }
      } catch (requestError) {
        if (active) {
          setUser(null);
          setRole(null);
          setError(requestError.message || "Unable to verify your account.");
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [session]);

  const logout = async () => {
    setError("");
    try {
      const result = await logoutUser();
      if (!result.success) {
        throw new Error(result.error.message);
      }
    } catch (logoutError) {
      setError(logoutError.message || "Unable to log out.");
      throw logoutError;
    }
  };

  const value = useMemo(
    () => ({ session, user, role, loading, error, logout }),
    [session, user, role, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
