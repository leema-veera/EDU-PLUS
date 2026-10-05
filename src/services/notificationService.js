import { supabase } from "../lib/supabase";
import { requireAuthenticatedUser } from "./studentRecordService";

export async function getMyNotifications() {
  const user = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function markNotificationRead(notificationId) {
  if (!notificationId) {
    throw new Error("A notification ID is required.");
  }
  const user = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("Notification not found or access denied.");
  }

  return data;
}
