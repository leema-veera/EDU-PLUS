import {
  deleteStudentRecord,
  insertStudentRecord,
  listStudentRecords,
  updateStudentRecord,
} from "./studentRecordService";

const TABLE = "internships";

export function getInternships(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getMyInternships() {
  return getInternships();
}

export function addInternship(internship) {
  return insertStudentRecord(TABLE, internship);
}

export function addInternshipForStudent(studentId, internship) {
  return insertStudentRecord(TABLE, internship, studentId);
}

export function updateInternship(id, changes) {
  return updateStudentRecord(TABLE, id, changes);
}

export function deleteInternship(id) {
  return deleteStudentRecord(TABLE, id);
}
