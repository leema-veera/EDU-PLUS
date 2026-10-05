import { supabase } from "../lib/supabase";
import { requireAuthenticatedUser } from "./studentRecordService";

export async function getMyStudentProfile() {
  const user = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getStudentById(studentId) {
  if (!studentId) {
    throw new Error("A student ID is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMyStudentProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error("A profile object is required.");
  }
  const user = await requireAuthenticatedUser();
  const {
    user_id: ignoredUserId,
    id: ignoredId,
    role: ignoredRole,
    user_role: ignoredUserRole,
    role_id: ignoredRoleId,
    is_admin: ignoredAdminFlag,
    is_staff: ignoredStaffFlag,
    permissions: ignoredPermissions,
    ...profileFields
  } = profile;
  void ignoredUserId;
  void ignoredId;
  void ignoredRole;
  void ignoredUserRole;
  void ignoredRoleId;
  void ignoredAdminFlag;
  void ignoredStaffFlag;
  void ignoredPermissions;
  const { data, error } = await supabase
    .from("student_profiles")
    .update(profileFields)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Student profile not found or access denied.");
  }

  return data;
}

export async function getStudents() {
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
