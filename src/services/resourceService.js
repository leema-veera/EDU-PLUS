import { supabase } from "../lib/supabase";
import { requireAuthenticatedUser } from "./studentRecordService";
import {
  deleteLearningMaterial,
  downloadLearningMaterial,
  listLearningMaterials,
  uploadLearningMaterial,
} from "./storageService";

export async function getResources() {
  await requireAuthenticatedUser();
  const { data, error } = await supabase.from("resources").select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function listResourceFiles(folder = "") {
  return listLearningMaterials(folder);
}

export async function uploadResource(file, filePath) {
  return uploadLearningMaterial(file, filePath);
}

export async function downloadResource(filePath) {
  return downloadLearningMaterial(filePath);
}

export async function deleteResourceFile(filePath) {
  return deleteLearningMaterial(filePath);
}
