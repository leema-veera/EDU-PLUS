import {
  deleteStudentRecord,
  insertStudentRecord,
  listStudentRecords,
  updateStudentRecord,
} from "./studentRecordService";

const TABLE = "projects";

export function getProjects(studentId) {
  return listStudentRecords(TABLE, studentId, {
    orderBy: "created_at",
    ascending: false,
  });
}

export function getMyProjects() {
  return getProjects();
}

export function addProject(project) {
  return insertStudentRecord(TABLE, project);
}

export function addProjectForStudent(studentId, project) {
  return insertStudentRecord(TABLE, project, studentId);
}

export function updateProject(projectId, project) {
  return updateStudentRecord(TABLE, projectId, project);
}

export function deleteProject(projectId) {
  return deleteStudentRecord(TABLE, projectId);
}
