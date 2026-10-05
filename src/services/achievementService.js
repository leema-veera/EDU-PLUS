import {
  deleteStudentRecord,
  insertStudentRecord,
  listStudentRecords,
  updateStudentRecord,
} from "./studentRecordService";

const TABLE = "achievements";

export function getAchievements(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getMyAchievements() {
  return getAchievements();
}

export function addAchievement(achievement) {
  return insertStudentRecord(TABLE, achievement);
}

export function addAchievementForStudent(studentId, achievement) {
  return insertStudentRecord(TABLE, achievement, studentId);
}

export function updateAchievement(id, changes) {
  return updateStudentRecord(TABLE, id, changes);
}

export function deleteAchievement(id) {
  return deleteStudentRecord(TABLE, id);
}
