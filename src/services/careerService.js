import { supabase } from "../lib/supabase";
import {
  getStudentRecord,
  resolveStudentId,
} from "./studentRecordService";

const TABLE = "career_profiles";

export function getCareerProfile(studentId) {
  return getStudentRecord(TABLE, studentId);
}

export function getMyCareerProfile() {
  return getCareerProfile();
}

export async function saveCareerProfile(studentId, careerData) {
  if (!careerData || typeof careerData !== "object" || Array.isArray(careerData)) {
    throw new Error("Career profile data is required.");
  }
  const resolvedStudentId = await resolveStudentId(studentId);
  const { student_id: ignoredStudentId, id: ignoredId, ...fields } = careerData;
  void ignoredStudentId;
  void ignoredId;
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      { ...fields, student_id: resolvedStudentId },
      { onConflict: "student_id" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function saveMyCareerProfile(careerData) {
  return saveCareerProfile(undefined, careerData);
}

export function deleteCareerProfile(studentId) {
  return deleteStudentRecordByStudent(TABLE, studentId);
}

async function deleteStudentRecordByStudent(table, studentId) {
  const resolvedStudentId = await resolveStudentId(studentId);
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("student_id", resolvedStudentId)
    .select("student_id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Career profile not found or access denied.");
  }
}
