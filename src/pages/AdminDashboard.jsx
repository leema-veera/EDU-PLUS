import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import AdminRecordManager from "../components/AdminRecordManager";
import AdminStorageManager from "../components/AdminStorageManager";
import AdminTable from "../components/AdminTable";
import {
  createMentorAssignment,
  deleteMentorAssignmentByAdmin,
  getAdminMentorAssignments,
  getAdminStaff,
  getAdminStudents,
  getAdminUsers,
  updateMentorAssignmentByAdmin,
} from "../services/adminService";

const SECTIONS = [
  ["overview", "Overview"],
  ["users", "Users"],
  ["students", "Students"],
  ["staff", "Staff / mentors"],
  ["assignments", "Mentor assignments"],
  ["resources", "Learning resources"],
  ["papers", "Question papers"],
  ["notifications", "Notifications"],
  ["events", "Events"],
];

const DATA_LOADERS = {
  users: getAdminUsers,
  students: getAdminStudents,
  staff: getAdminStaff,
  assignments: getAdminMentorAssignments,
};

const TABLE_COLUMNS = {
  users: [
    ["id", "Profile ID"],
    ["email", "Email"],
    ["role", "Role"],
  ],
  students: [
    ["id", "Student ID"],
    ["student_code", "Student code"],
    ["name", "Name"],
    ["department", "Department"],
    ["year", "Year"],
  ],
  staff: [
    ["id", "Staff ID"],
    ["staff_code", "Staff code"],
    ["name", "Name"],
    ["department", "Department"],
    ["designation", "Designation"],
  ],
  assignments: [
    ["id", "Assignment ID"],
    ["mentor_id", "Mentor ID"],
    ["student_id", "Student ID"],
    ["status", "Status"],
    ["assigned_at", "Assigned at"],
  ],
};

function AssignmentManager({ students, staff, assignments, loading, error, onChanged }) {
  const [mentorId, setMentorId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("active");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleAssign(event) {
    event.preventDefault();
    setActionError("");
    setNotice("");
    if (!mentorId || !studentId) {
      setActionError("Choose a staff member and student.");
      return;
    }

    setBusy(true);
    try {
      await createMentorAssignment({
        mentor_id: mentorId,
        student_id: studentId,
        status,
      });
      setNotice("Mentor assignment created.");
      await onChanged();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to create assignment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(assignmentId, nextStatus) {
    setActionError("");
    setNotice("");
    setBusy(true);
    try {
      await updateMentorAssignmentByAdmin(assignmentId, { status: nextStatus });
      setNotice("Assignment updated.");
      await onChanged();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to update assignment.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(assignmentId) {
    if (!window.confirm("Delete this mentor assignment?")) {
      return;
    }
    setActionError("");
    setNotice("");
    setBusy(true);
    try {
      await deleteMentorAssignmentByAdmin(assignmentId);
      setNotice("Assignment deleted.");
      await onChanged();
    } catch (requestError) {
      setActionError(requestError.message || "Unable to delete assignment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-panel">
      <header className="admin-panel-header">
        <div>
          <h2>Manage mentor assignments</h2>
          <span className="admin-row-count">{loading ? "Loading…" : `${assignments.length} assignments`}</span>
        </div>
      </header>
      {(error || actionError) && <p className="dashboard-error" role="alert">{error || actionError}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      <form className="admin-assignment-form" onSubmit={handleAssign}>
        <label>
          Staff / mentor
          <select value={mentorId} onChange={(event) => setMentorId(event.target.value)} required>
            <option value="">Select staff member</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name || member.staff_code || member.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Student
          <select value={studentId} onChange={(event) => setStudentId(event.target.value)} required>
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name || student.student_code || student.id}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <button type="submit" disabled={busy || loading || !students.length || !staff.length}>
          {busy ? "Saving…" : "Assign mentor"}
        </button>
      </form>

      {loading ? (
        <p className="dashboard-muted" role="status">Loading assignments…</p>
      ) : assignments.length === 0 ? (
        <p className="dashboard-muted">No mentor assignments yet.</p>
      ) : (
        <div className="admin-assignment-list">
          {assignments.map((assignment) => (
            <article className="admin-assignment-row" key={assignment.id}>
              <div>
                <strong>{assignment.student_profiles?.name || assignment.student_id}</strong>
                <span>
                  Mentor: {assignment.staff_profiles?.name || assignment.mentor_id}
                  {" · "}Student ID: {assignment.student_id}
                  {" · "}Status: {assignment.status}
                </span>
              </div>
              <div className="admin-record-actions">
                <select
                  aria-label={`Status for assignment ${assignment.id}`}
                  value={assignment.status}
                  disabled={busy}
                  onChange={(event) => handleStatusChange(assignment.id, event.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button type="button" className="admin-danger-button" disabled={busy} onClick={() => handleDelete(assignment.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState("overview");
  const [dataResult, setDataResult] = useState({
    userId: null,
    refreshToken: -1,
    data: {},
  });
  const [refreshToken, setRefreshToken] = useState(0);
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    const keys = Object.keys(DATA_LOADERS);

    Promise.all(
      keys.map(async (key) => {
        try {
          const rows = await DATA_LOADERS[key]();
          return [key, { loading: false, rows, error: "" }];
        } catch (error) {
          return [key, { loading: false, rows: [], error: error.message || `Unable to load ${key}.` }];
        }
      }),
    ).then((results) => {
      if (active) {
        setDataResult({
          userId: user?.id ?? null,
          refreshToken,
          data: Object.fromEntries(results),
        });
      }
    });

    return () => {
      active = false;
    };
  }, [user?.id, refreshToken]);

  const hasCurrentData = dataResult.userId === user?.id && dataResult.refreshToken === refreshToken;
  const loadedData = hasCurrentData ? dataResult.data : {};
  const data = Object.fromEntries(
    Object.keys(DATA_LOADERS).map((key) => [
      key,
      loadedData[key] ?? { loading: true, rows: [], error: "" },
    ]),
  );

  function refreshAdminData() {
    setRefreshToken((token) => token + 1);
  }

  async function handleLogout() {
    setLogoutError("");
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message || "Unable to log out.");
      setLoggingOut(false);
    }
  }

  const currentData = data[section];
  const counts = [
    ["Users", data.users],
    ["Students", data.students],
    ["Staff / mentors", data.staff],
    ["Assignments", data.assignments],
  ];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">EDU PLUS · ADMIN</p>
          <h1>Admin dashboard</h1>
          <p className="dashboard-muted">{user?.email}</p>
        </div>
        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </header>
      {logoutError && <p className="dashboard-error" role="alert">{logoutError}</p>}

      <nav className="admin-nav" aria-label="Admin dashboard sections">
        {SECTIONS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={section === key ? "is-active" : ""}
            aria-current={section === key ? "page" : undefined}
            onClick={() => setSection(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {section === "overview" ? (
        <div className="admin-overview">
          <div className="admin-count-grid">
            {counts.map(([label, result]) => (
              <section className="admin-count-card" key={label}>
                <span>{label}</span>
                <strong>
                  {result?.loading || !result
                    ? "Loading…"
                    : result.error
                      ? "—"
                      : result.rows.length}
                </strong>
                {result?.error && <small role="alert">{result.error}</small>}
              </section>
            ))}
          </div>
          <p className="dashboard-muted">
            Admin operations use the current Supabase session and remain subject to database and Storage RLS.
          </p>
        </div>
      ) : section === "users" ? (
        <AdminTable
          title="Users (profiles)"
          rows={currentData?.rows ?? []}
          loading={!currentData || currentData.loading}
          error={currentData?.error}
          columns={TABLE_COLUMNS.users}
        />
      ) : section === "students" ? (
        <AdminTable
          title="Students"
          rows={currentData?.rows ?? []}
          loading={!currentData || currentData.loading}
          error={currentData?.error}
          columns={TABLE_COLUMNS.students}
        />
      ) : section === "staff" ? (
        <AdminTable
          title="Staff and mentors"
          rows={currentData?.rows ?? []}
          loading={!currentData || currentData.loading}
          error={currentData?.error}
          columns={TABLE_COLUMNS.staff}
        />
      ) : section === "assignments" ? (
        <AssignmentManager
          students={data.students?.rows ?? []}
          staff={data.staff?.rows ?? []}
          assignments={data.assignments?.rows ?? []}
          loading={Object.values(data).some((result) => result.loading)}
          error={data.students?.error || data.staff?.error || data.assignments?.error}
          onChanged={refreshAdminData}
        />
      ) : section === "resources" ? (
        <div className="admin-management-stack">
          <AdminRecordManager title="Learning resource records" table="resources" />
          <AdminStorageManager bucket="learning-materials" title="Learning resource files" />
        </div>
      ) : section === "papers" ? (
        <div className="admin-management-stack">
          <AdminRecordManager title="Question paper records" table="question_papers" />
          <AdminStorageManager bucket="question-papers" title="Question paper files" />
        </div>
      ) : section === "notifications" ? (
        <AdminRecordManager title="Notifications" table="notifications" />
      ) : (
        <AdminRecordManager title="Events" table="events" />
      )}
    </main>
  );
}
