import { getCurrentUser, getUserRole } from "./authService";

export async function getCurrentRole() {
  const userResult = await getCurrentUser();
  if (!userResult.success) {
    return userResult;
  }
  if (!userResult.data) {
    return {
      success: false,
      data: null,
      error: { message: "You must be signed in to load your role.", code: null, status: null },
    };
  }

  return getUserRole(userResult.data.id);
}
