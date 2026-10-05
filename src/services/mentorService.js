import { supabase } from "../lib/supabase";
import { requireAuthenticatedUser } from "./studentRecordService";

export async function getMyMentees() {
  const user = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("mentor_assignments")
    .select(`
      id,
      mentor_id,
      student_id,
      status,
      assigned_at,
      student_profiles (
        id,
        student_code,
        name,
        department,
        year,
        semester,
        section,
        phone
      )
    `)
    .eq("mentor_id", user.id)
    .eq("status", "active")
    .order("assigned_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getMentee(studentId) {
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

export async function getMentorAssignments() {
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("mentor_assignments")
    .select(`
      id,
      mentor_id,
      student_id,
      status,
      assigned_at,
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
    `)
    .order("assigned_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function assignMentor(mentorId, studentId) {
  if (!mentorId || !studentId) {
    throw new Error("A mentor ID and student ID are required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("mentor_assignments")
    .insert({ mentor_id: mentorId, student_id: studentId, status: "active" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMentorAssignment(assignmentId, status) {
  if (!assignmentId || !status) {
    throw new Error("An assignment ID and status are required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("mentor_assignments")
    .update({ status })
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

export async function deleteMentorAssignment(assignmentId) {
  if (!assignmentId) {
    throw new Error("An assignment ID is required.");
  }
  await requireAuthenticatedUser();
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
