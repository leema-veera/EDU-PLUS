import {
  deleteStudentRecord,
  insertStudentRecord,
  listStudentRecords,
  updateStudentRecord,
} from "./studentRecordService";

const TABLE = "certifications";

export function getCertifications(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getMyCertifications() {
  return getCertifications();
}

export function addCertification(certification) {
  return insertStudentRecord(TABLE, certification);
}

export function addCertificationForStudent(studentId, certification) {
  return insertStudentRecord(TABLE, certification, studentId);
}

export function updateCertification(id, changes) {
  return updateStudentRecord(TABLE, id, changes);
}

export function deleteCertification(id) {
  return deleteStudentRecord(TABLE, id);
}
