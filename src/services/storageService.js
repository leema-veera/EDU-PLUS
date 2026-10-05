import { supabase } from "../lib/supabase";
import { requireAuthenticatedUser } from "./studentRecordService";

const LEARNING_BUCKET = "learning-materials";
const QUESTION_BUCKET = "question-papers";

// Upload learning material
export async function uploadLearningMaterial(file, filePath) {
  if (!file) {
    throw new Error("Please select a file");
  }
  if (!filePath || typeof filePath !== "string") {
    throw new Error("A storage path is required.");
  }
  await requireAuthenticatedUser();

  const { data, error } = await supabase.storage
    .from(LEARNING_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data;
}

// Upload question paper
export async function uploadQuestionPaper(file, filePath) {
  if (!file) {
    throw new Error("Please select a file");
  }
  if (!filePath || typeof filePath !== "string") {
    throw new Error("A storage path is required.");
  }
  await requireAuthenticatedUser();

  const { data, error } = await supabase.storage
    .from(QUESTION_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return data;
}

// Download learning material
export async function downloadLearningMaterial(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("A storage path is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase.storage
    .from(LEARNING_BUCKET)
    .download(filePath);

  if (error) {
    throw error;
  }

  return data;
}

// Download question paper
export async function downloadQuestionPaper(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("A storage path is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase.storage
    .from(QUESTION_BUCKET)
    .download(filePath);

  if (error) {
    throw error;
  }

  return data;
}

// List learning materials
export async function listLearningMaterials(folder = "") {
  await requireAuthenticatedUser();
  const { data, error } = await supabase.storage
    .from(LEARNING_BUCKET)
    .list(folder);

  if (error) {
    throw error;
  }

  return data ?? [];
}

// List question papers
export async function listQuestionPapers(folder = "") {
  await requireAuthenticatedUser();
  const { data, error } = await supabase.storage
    .from(QUESTION_BUCKET)
    .list(folder);

  if (error) {
    throw error;
  }

  return data ?? [];
}

// Delete learning material
export async function deleteLearningMaterial(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("A storage path is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase.storage
    .from(LEARNING_BUCKET)
    .remove([filePath]);

  if (error) {
    throw error;
  }

  return data;
}

// Delete question paper
export async function deleteQuestionPaper(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("A storage path is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase.storage
    .from(QUESTION_BUCKET)
    .remove([filePath]);

  if (error) {
    throw error;
  }

  return data;
}

// Get public URL
// Use only if the bucket is public.
export function getPublicFileUrl(bucket, filePath) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Create signed URL for a private bucket
export async function createSignedUrl(
  bucket,
  filePath,
  expiresIn = 3600
) {
  if (!bucket || !filePath || !Number.isInteger(expiresIn) || expiresIn <= 0) {
    throw new Error("A bucket, storage path, and positive expiry are required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}