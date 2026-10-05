import { supabase } from "../lib/supabase";
import { requireAdminUser } from "./adminService";

const CONTENT_TABLES = new Set([
  "resources",
  "question_papers",
  "notifications",
  "events",
]);

function validateTable(table) {
  if (!CONTENT_TABLES.has(table)) {
    throw new Error("Unsupported admin content table.");
  }
}

function validateRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("Provide a JSON object.");
  }
}

export async function getAdminContent(table) {
  validateTable(table);
  await requireAdminUser();
  const { data, error } = await supabase.from(table).select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createAdminContent(table, record) {
  validateTable(table);
  validateRecord(record);
  await requireAdminUser();
  const { id: ignoredId, ...fields } = record;
  void ignoredId;
  const { data, error } = await supabase
    .from(table)
    .insert(fields)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAdminContent(table, id, changes) {
  validateTable(table);
  validateRecord(changes);
  if (!id) {
    throw new Error("A record ID is required.");
  }
  await requireAdminUser();
  const { id: ignoredId, ...fields } = changes;
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

export async function deleteAdminContent(table, id) {
  validateTable(table);
  if (!id) {
    throw new Error("A record ID is required.");
  }
  await requireAdminUser();
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
