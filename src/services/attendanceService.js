import {
  deleteStudentRecord,
  insertStudentRecord,
  listStudentRecords,
  updateStudentRecord,
} from "./studentRecordService";

const TABLE = "attendance";

export function getAttendance(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "subject",
    ascending: true,
  });
}

export function getMyAttendance() {
  return getAttendance();
}

export function addAttendance(record) {
  return insertStudentRecord(TABLE, record);
}

export function addAttendanceForStudent(studentId, record) {
  return insertStudentRecord(TABLE, record, studentId);
}

export function updateAttendance(id, record) {
  return updateStudentRecord(TABLE, id, record);
}

export function deleteAttendance(id) {
  return deleteStudentRecord(TABLE, id);
}
