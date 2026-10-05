import {
  deleteStudentRecord,
  insertStudentRecord,
  listStudentRecords,
  updateStudentRecord,
} from "./studentRecordService";

const TABLE = "skills";

export function getSkills(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getMySkills() {
  return getSkills();
}

export function addSkill(skillData) {
  return insertStudentRecord(TABLE, skillData);
}

export function addSkillForStudent(studentId, skillData) {
  return insertStudentRecord(TABLE, skillData, studentId);
}

export function updateSkill(skillId, skillData) {
  return updateStudentRecord(TABLE, skillId, skillData);
}

export function deleteSkill(skillId) {
  return deleteStudentRecord(TABLE, skillId);
}
