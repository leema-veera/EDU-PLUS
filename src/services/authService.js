import { supabase } from "../lib/supabase";

const ALLOWED_ROLES = new Set(["student", "staff", "admin"]);

function success(data) {
  return { success: true, data, error: null };
}

function failure(error, fallbackMessage) {
  return {
    success: false,
    data: null,
    error: {
      message: error?.message || fallbackMessage,
      code: error?.code ?? null,
      status: error?.status ?? null,
    },
  };
}

function loginFailure(error) {
  const code = String(error?.code ?? "").toLowerCase();
  const message = String(error?.message ?? "").toLowerCase();

  if (
    code === "invalid_credentials"
    || code === "invalid_grant"
    || message.includes("invalid login credentials")
    || message.includes("invalid email or password")
  ) {
    return failure(
      {
        ...error,
        message:
          "Email or password not recognized. Check your credentials and confirm that this account exists in the configured EDU PLUS Supabase project.",
      },
      "Email or password not recognized.",
    );
  }

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return failure(
      {
        ...error,
        message: "Confirm your email address before signing in.",
      },
      "Confirm your email address before signing in.",
    );
  }

  return failure(error, "Unable to sign in. Please try again.");
}

export async function loginUser(email, password) {
  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return failure(null, "Email and password are required.");
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return loginFailure(error);
    }
    if (!data.user || !data.session) {
      return failure(null, "Authentication did not return a valid session.");
    }

    const roleResult = await getUserRole(data.user.id);
    if (!roleResult.success) {
      return roleResult;
    }

    return success({
      user: data.user,
      session: data.session,
      role: roleResult.data,
      redirectTo: `/${roleResult.data}`,
    });
  } catch (error) {
    return failure(error, "Unable to sign in.");
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return failure(error, "Unable to sign out.");
    }

    return success(null);
  } catch (error) {
    return failure(error, "Unable to sign out.");
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return failure(error, "Unable to retrieve the authenticated user.");
    }

    return success(user);
  } catch (error) {
    return failure(error, "Unable to retrieve the authenticated user.");
  }
}

export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return failure(error, "Unable to retrieve the current session.");
    }

    return success(session);
  } catch (error) {
    return failure(error, "Unable to retrieve the current session.");
  }
}

export async function getUserRole(userId) {
  if (typeof userId !== "string" || !userId.trim()) {
    return failure(null, "A valid user ID is required to retrieve a role.");
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      return failure(authError, "Unable to verify the authenticated user.");
    }
    if (!user) {
      return failure(null, "You must be signed in to retrieve a role.");
    }
    if (user.id !== userId) {
      return failure(null, "You can only retrieve your own role.");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return failure(error, "Unable to retrieve the account role.");
    }

    const role = String(data?.role ?? "").toLowerCase();
    if (!ALLOWED_ROLES.has(role)) {
      return failure(null, "No valid role is configured for this account.");
    }

    return success(role);
  } catch (error) {
    return failure(error, "Unable to retrieve the account role.");
  }
}

export function onAuthStateChange(callback) {
  if (typeof callback !== "function") {
    throw new TypeError("An auth state change callback is required.");
  }

  return supabase.auth.onAuthStateChange(callback);
}
