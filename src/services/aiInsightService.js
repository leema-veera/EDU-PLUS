import { listStudentRecords } from "./studentRecordService";

const TABLE = "ai_insights";

export function getAIInsights(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getMyAIInsights() {
  return getAIInsights();
}
