import { supabase } from "../lib/supabase";
import { requireAuthenticatedUser } from "./studentRecordService";

export async function getEvents() {
  await requireAuthenticatedUser();
  const { data, error } = await supabase.from("events").select("*");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createEvent(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error("An event object is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateEvent(eventId, changes) {
  if (!eventId || !changes || typeof changes !== "object" || Array.isArray(changes)) {
    throw new Error("An event ID and event changes are required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("events")
    .update(changes)
    .eq("id", eventId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Event not found or access denied.");
  }

  return data;
}

export async function deleteEvent(eventId) {
  if (!eventId) {
    throw new Error("An event ID is required.");
  }
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Event not found or access denied.");
  }
}
