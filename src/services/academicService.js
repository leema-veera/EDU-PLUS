import {
  deleteStudentRecord,
  insertStudentRecord,
  listStudentRecords,
  updateStudentRecord,
} from "./studentRecordService";

const TABLE = "academics";

export function getAcademics(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "semester",
    ascending: true,
  });
}

export function getMyAcademics() {
  return getAcademics();
}

export function addAcademicRecord(record) {
  return insertStudentRecord(TABLE, record);
}

export function addAcademicRecordForStudent(studentId, record) {
  return insertStudentRecord(TABLE, record, studentId);
}

export function updateAcademicRecord(id, record) {
  return updateStudentRecord(TABLE, id, record);
}

export function deleteAcademicRecord(id) {
  return deleteStudentRecord(TABLE, id);
}
