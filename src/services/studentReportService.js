import { listStudentRecords } from "./studentRecordService";

const TABLE = "student_reports";

export function getStudentReports(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getMyStudentReports() {
  return getStudentReports();
}
