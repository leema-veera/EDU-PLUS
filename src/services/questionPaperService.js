import { supabase } from "../lib/supabase";
import { requireAuthenticatedUser } from "./studentRecordService";
import {
  deleteQuestionPaper as deleteQuestionPaperFile,
  downloadQuestionPaper as downloadQuestionPaperFile,
  listQuestionPapers as listQuestionPaperFiles,
  uploadQuestionPaper as uploadQuestionPaperFile,
} from "./storageService";

export async function getQuestionPapers() {
  await requireAuthenticatedUser();
  const { data, error } = await supabase.from("question_papers").select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listQuestionPapers(folder = "") {
  return listQuestionPaperFiles(folder);
}

export async function uploadQuestionPaper(file, filePath) {
  return uploadQuestionPaperFile(file, filePath);
}

export async function downloadQuestionPaper(filePath) {
  return downloadQuestionPaperFile(filePath);
}

export async function deleteQuestionPaper(filePath) {
  return deleteQuestionPaperFile(filePath);
}
