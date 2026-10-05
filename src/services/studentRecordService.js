import { supabase } from "../lib/supabase";

export async function requireAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("You must be signed in to access student records.");
  }

  return user;
}

export async function getMyStudentProfileId() {
  const user = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No student profile is linked to the signed-in user.");
  }

  return data.id;
}

export async function resolveStudentId(studentId) {
  if (studentId !== undefined && studentId !== null) {
    if (typeof studentId !== "string" || studentId.trim() === "") {
      throw new Error("A valid student ID is required.");
    }
    await requireAuthenticatedUser();
    return studentId;
  }

  return getMyStudentProfileId();
}

export async function listStudentRecords(
  table,
  studentId,
  { orderBy, ascending = true } = {},
) {
  const authorizedStudentId = await resolveStudentId(studentId);
  let request = supabase
    .from(table)
    .select("*")
    .eq("student_id", authorizedStudentId);

  if (orderBy) {
    request = request.order(orderBy, { ascending });
  }

  const { data, error } = await request;
  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getStudentRecord(table, studentId) {
  const authorizedStudentId = await resolveStudentId(studentId);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("student_id", authorizedStudentId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function validateRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("A record object is required.");
  }
}

export async function insertStudentRecord(table, record, studentId) {
  validateRecord(record);
  const authorizedStudentId = await resolveStudentId(studentId);
  const { student_id: ignoredStudentId, ...fields } = record;
  void ignoredStudentId;
  const { data, error } = await supabase
    .from(table)
    .insert({ ...fields, student_id: authorizedStudentId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateStudentRecord(table, id, changes) {
  if (id === undefined || id === null || id === "") {
    throw new Error("A record ID is required.");
  }
  validateRecord(changes);
  await requireAuthenticatedUser();
  const {
    student_id: ignoredStudentId,
    id: ignoredId,
    ...fields
  } = changes;
  void ignoredStudentId;
  void ignoredId;
  const { data, error } = await supabase
    .from(table)
    .update(fields)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Record not found or access denied.");
  }

  return data;
}

export async function deleteStudentRecord(table, id) {
  if (id === undefined || id === null || id === "") {
    throw new Error("A record ID is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Record not found or access denied.");
  }
}
