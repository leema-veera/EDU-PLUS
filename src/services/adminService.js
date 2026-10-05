import { supabase } from "../lib/supabase";

export async function requireAdminUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }
  if (!user) {
    throw new Error("You must be signed in to access admin data.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (String(profile?.role ?? "").toLowerCase() !== "admin") {
    throw new Error("An admin profile is required for this operation.");
  }

  return user;
}

async function listAdminTable(table) {
  await requireAdminUser();
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    throw error;
  }

  return data ?? [];
}

export function getAdminUsers() {
  return listAdminTable("profiles");
}

export function getAdminStudents() {
  return listAdminTable("student_profiles");
}

export function getAdminStaff() {
  return listAdminTable("staff_profiles");
}

export async function getAdminMentorAssignments() {
  await requireAdminUser();
  const { data, error } = await supabase
    .from("mentor_assignments")
    .select(`
      *,
      student_profiles (
        id,
        student_code,
        name,
        department,
        year,
        semester,
        section
      ),
      staff_profiles (
        id,
        staff_code,
        name,
        department,
        designation
      )
    `);

  if (error) {
    throw error;
  }

  return data ?? [];
}

function validateRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("Provide a JSON object.");
  }
}

export async function createMentorAssignment(assignment) {
  validateRecord(assignment);
  await requireAdminUser();
  const { id: ignoredId, ...fields } = assignment;
  void ignoredId;
  const { data, error } = await supabase
    .from("mentor_assignments")
    .insert(fields)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMentorAssignmentByAdmin(assignmentId, changes) {
  if (!assignmentId) {
    throw new Error("An assignment ID is required.");
  }
  validateRecord(changes);
  await requireAdminUser();
  const { id: ignoredId, ...fields } = changes;
  void ignoredId;
  const { data, error } = await supabase
    .from("mentor_assignments")
    .update(fields)
    .eq("id", assignmentId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Assignment not found or access denied.");
  }

  return data;
}

export async function deleteMentorAssignmentByAdmin(assignmentId) {
  if (!assignmentId) {
    throw new Error("An assignment ID is required.");
  }
  await requireAdminUser();
  const { data, error } = await supabase
    .from("mentor_assignments")
    .delete()
    .eq("id", assignmentId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Assignment not found or access denied.");
  }
}
