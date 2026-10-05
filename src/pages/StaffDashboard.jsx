import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { getAcademics } from "../services/academicService";
import { getAIInsights } from "../services/aiInsightService";
import { getAttendance } from "../services/attendanceService";
import { getCareerProfile } from "../services/careerService";
import { getCertifications } from "../services/certificationService";
import { getInternships } from "../services/internshipService";
import { getProjects } from "../services/projectService";
import { getMyMentees } from "../services/mentorService";
import { getSkills } from "../services/skillService";
import { getStudentReports } from "../services/studentReportService";

const EMPTY_ASSIGNMENTS = [];

const DETAIL_LOADERS = [
  ["academics", "Academic overview", getAcademics],
  ["attendance", "Attendance overview", getAttendance],
  ["skills", "Skills", getSkills],
  ["projects", "Projects", getProjects],
  ["certifications", "Certifications", getCertifications],
  ["internships", "Internships", getInternships],
  ["career", "Career status", getCareerProfile],
  ["insights", "AI insights", getAIInsights],
  ["report", "Student report", getStudentReports],
];

function profileFromAssignment(assignment) {
  const profile = assignment?.student_profiles;
  return Array.isArray(profile) ? profile[0] ?? null : profile ?? null;
}

function showValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function titleForRecord(record) {
  for (const key of ["name", "title", "skill_name", "subject", "course_name", "company", "target_role"]) {
    if (record?.[key]) {
      return showValue(record[key]);
    }
  }
  return "Record";
}

function detailsForRecord(record) {
  const hiddenFields = new Set([
    "id",
    "student_id",
    "user_id",
    "created_at",
    "updated_at",
    "name",
    "title",
    "skill_name",
    "subject",
    "course_name",
    "company",
    "target_role",
  ]);

  return Object.entries(record ?? {})
    .filter(([key, value]) => !hiddenFields.has(key) && value !== null && value !== "")
    .slice(0, 3)
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${showValue(value)}`)
    .join(" · ");
}

function RecordsCard({ title, result }) {
  if (result?.loading) {
    return (
      <section className="dashboard-card">
        <h3>{title}</h3>
        <p className="dashboard-muted" role="status">Loading…</p>
      </section>
    );
  }

  if (result?.error) {
    return (
      <section className="dashboard-card">
        <h3>{title}</h3>
        <p className="dashboard-error" role="alert">{result.error}</p>
      </section>
    );
  }

  const records = result?.data;
  const items = records === null || records === undefined
    ? []
    : Array.isArray(records)
      ? records
      : [records];

  return (
    <section className="dashboard-card">
      <h3>{title}</h3>
      {!items.length ? (
        <p className="dashboard-muted">No records available.</p>
      ) : (
        <ul className="dashboard-list">
          {items.map((record, index) => (
            <li key={record?.id ?? `${title}-${index}`}>
              <strong>{titleForRecord(record)}</strong>
              {detailsForRecord(record) && (
                <span className="dashboard-muted">{detailsForRecord(record)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StudentDetails({ assignment, result }) {
  const profile = profileFromAssignment(assignment);
  const studentId = assignment.student_id;

  return (
    <div className="staff-student-details">
      <section className="dashboard-card">
        <h3>Student overview</h3>
        <dl className="staff-student-meta">
          <div><dt>Name</dt><dd>{profile?.name || "Profile unavailable"}</dd></div>
          <div><dt>Department</dt><dd>{showValue(profile?.department)}</dd></div>
          <div><dt>Year</dt><dd>{showValue(profile?.year)}</dd></div>
          <div><dt>Semester</dt><dd>{showValue(profile?.semester)}</dd></div>
          <div><dt>Section</dt><dd>{showValue(profile?.section)}</dd></div>
        </dl>
      </section>
      <div className="dashboard-grid">
        {DETAIL_LOADERS.map(([key, title]) => (
          <RecordsCard
            key={key}
            title={title}
            result={
              result?.studentId === studentId
                ? result.sections[key]
                : { loading: true, data: null, error: "" }
            }
          />
        ))}
      </div>
    </div>
  );
}

function StudentAssignmentCard({ assignment, selected, onSelect }) {
  const profile = profileFromAssignment(assignment);
  const name = profile?.name || "Assigned student";

  return (
    <button
      type="button"
      className={`staff-assignment ${selected ? "is-selected" : ""}`}
      aria-expanded={selected}
      onClick={onSelect}
    >
      <span className="staff-assignment-copy">
        <strong>{name}</strong>
        <span>
          {[profile?.department, profile?.year && `Year ${profile.year}`, profile?.section && `Section ${profile.section}`]
            .filter(Boolean)
            .join(" · ") || "Student details unavailable"}
        </span>
      </span>
      <span className="staff-assignment-action">{selected ? "Hide details" : "View details"}</span>
    </button>
  );
}

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [assignmentsResult, setAssignmentsResult] = useState({
    userId: null,
    data: [],
    error: "",
  });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [detailsResult, setDetailsResult] = useState({
    studentId: null,
    sections: {},
  });
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    getMyMentees()
      .then((assignments) => {
        if (active) {
          setAssignmentsResult({
            userId: user?.id ?? null,
            data: assignments,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setAssignmentsResult({
            userId: user?.id ?? null,
            data: [],
            error: error.message || "Unable to load assigned students.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const assignmentsLoading = assignmentsResult.userId !== user?.id;
  const assignments = assignmentsLoading ? EMPTY_ASSIGNMENTS : assignmentsResult.data;
  const assignmentsError = assignmentsLoading ? "" : assignmentsResult.error;
  const assignedStudents = useMemo(
    () => [...new Map(assignments.map((assignment) => [assignment.student_id, assignment])).values()],
    [assignments],
  );
  const selectedAssignment = useMemo(
    () => assignedStudents.find((assignment) => assignment.id === selectedAssignmentId) ?? null,
    [assignedStudents, selectedAssignmentId],
  );
  const selectedStudentId = selectedAssignment?.student_id ?? null;

  useEffect(() => {
    if (!selectedStudentId) {
      return undefined;
    }

    let active = true;
    Promise.all(
      DETAIL_LOADERS.map(async ([key, , load]) => {
        try {
          const data = await load(selectedStudentId);
          return [key, { data, error: "", loading: false }];
        } catch (error) {
          return [
            key,
            {
              data: null,
              error: error.message || "Unable to load this student record.",
              loading: false,
            },
          ];
        }
      }),
    ).then((sections) => {
      if (active) {
        setDetailsResult({
          studentId: selectedStudentId,
          sections: Object.fromEntries(sections),
        });
      }
    });

    return () => {
      active = false;
    };
  }, [selectedStudentId]);

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

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">EDU PLUS · STAFF / MENTOR</p>
          <h1>Mentor dashboard</h1>
          <p className="dashboard-muted">{user?.email}</p>
        </div>
        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </header>

      {logoutError && <p className="dashboard-error" role="alert">{logoutError}</p>}
      <section className="staff-count-card" aria-live="polite">
        <span>Total assigned students</span>
        <strong>
          {assignmentsLoading
            ? "Loading…"
            : assignmentsError
              ? "—"
              : assignedStudents.length}
        </strong>
      </section>

      <section className="staff-assignments-section">
        <h2>My assigned students</h2>
        {assignmentsLoading ? (
          <p className="dashboard-loading" role="status">Loading assigned students…</p>
        ) : assignmentsError ? (
          <p className="dashboard-error" role="alert">{assignmentsError}</p>
        ) : assignedStudents.length === 0 ? (
          <p className="dashboard-empty">You do not have any active student assignments yet.</p>
        ) : (
          <div className="staff-assignment-list">
            {assignedStudents.map((assignment) => (
              <StudentAssignmentCard
                key={assignment.id}
                assignment={assignment}
                selected={selectedAssignmentId === assignment.id}
                onSelect={() => setSelectedAssignmentId(
                  selectedAssignmentId === assignment.id ? null : assignment.id,
                )}
              />
            ))}
          </div>
        )}
      </section>

      {selectedAssignment && (
        <section className="staff-details-section">
          <h2>{profileFromAssignment(selectedAssignment)?.name || "Assigned student details"}</h2>
          <StudentDetails assignment={selectedAssignment} result={detailsResult} />
        </section>
      )}
    </main>
  );
}
