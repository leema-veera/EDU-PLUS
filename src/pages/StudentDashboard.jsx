import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { getAcademics } from "../services/academicService";
import { getAchievements } from "../services/achievementService";
import { getAIInsights } from "../services/aiInsightService";
import { getAttendance } from "../services/attendanceService";
import { getCareerProfile } from "../services/careerService";
import { getCertifications } from "../services/certificationService";
import { getEvents } from "../services/eventService";
import { getInternships } from "../services/internshipService";
import { getMyNotifications } from "../services/notificationService";
import { getProjects } from "../services/projectService";
import { getQuestionPapers } from "../services/questionPaperService";
import { getResources } from "../services/resourceService";
import { getSkills } from "../services/skillService";
import { getStudentReports } from "../services/studentReportService";
import { getMyStudentProfile } from "../services/studentService";

const LOADERS = {
  profile: getMyStudentProfile,
  academics: getAcademics,
  attendance: getAttendance,
  skills: getSkills,
  projects: getProjects,
  certifications: getCertifications,
  internships: getInternships,
  achievements: getAchievements,
  career: getCareerProfile,
  insights: getAIInsights,
  reports: getStudentReports,
  resources: getResources,
  papers: getQuestionPapers,
  notifications: getMyNotifications,
  events: getEvents,
};

const SECTIONS = [
  { key: "skills", title: "Skills" },
  { key: "projects", title: "Projects" },
  { key: "certifications", title: "Certifications" },
  { key: "internships", title: "Internships" },
  { key: "achievements", title: "Achievements" },
  { key: "insights", title: "AI insights" },
  { key: "reports", title: "Student report" },
  { key: "resources", title: "Learning resources" },
  { key: "papers", title: "Question papers" },
  { key: "notifications", title: "Notifications" },
  { key: "events", title: "Events" },
];

function textValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function displayName(record) {
  for (const key of ["name", "title", "skill_name", "subject", "course_name", "role"]) {
    if (record?.[key]) {
      return textValue(record[key]);
    }
  }
  return "Record";
}

function displayDetail(record) {
  const excluded = new Set(["id", "student_id", "user_id", "created_at", "updated_at"]);
  return Object.entries(record ?? {})
    .filter(([key, value]) => !excluded.has(key) && value !== null && value !== "")
    .filter(([key]) => !["name", "title", "skill_name", "subject", "course_name", "role"].includes(key))
    .slice(0, 3)
    .map(([key, value]) => `${key.replaceAll("_", " ")}: ${textValue(value)}`)
    .join(" · ");
}

function firstValue(records, keys) {
  for (const record of records ?? []) {
    for (const key of keys) {
      const value = record?.[key];
      if (value !== null && value !== undefined && value !== "") {
        return value;
      }
    }
  }
  return null;
}

function getCgpa(profile, academics) {
  return profile?.cgpa ?? firstValue(academics, ["cgpa", "gpa"]);
}

function getAttendanceSummary(records) {
  if (!records?.length) {
    return "No attendance records";
  }

  const percentage = firstValue(records, ["attendance_percentage", "percentage"]);
  if (percentage !== null && Number.isFinite(Number(percentage))) {
    return `${Number(percentage).toFixed(1)}%`;
  }

  let attended = 0;
  let total = 0;
  for (const record of records) {
    const present = Number(record.present_classes ?? record.classes_attended ?? record.attended);
    const classes = Number(record.total_classes ?? record.classes_held ?? record.total);
    if (Number.isFinite(present) && Number.isFinite(classes) && classes > 0) {
      attended += present;
      total += classes;
    }
  }
  if (total > 0) {
    return `${((attended / total) * 100).toFixed(1)}%`;
  }

  return `${records.length} attendance ${records.length === 1 ? "record" : "records"}`;
}

function SectionCard({ title, state }) {
  return (
    <section className="dashboard-card">
      <h2>{title}</h2>
      {state?.loading ? (
        <p className="dashboard-muted" role="status">Loading {title.toLowerCase()}…</p>
      ) : state?.error ? (
        <p className="dashboard-error" role="alert">{state.error}</p>
      ) : !state?.data?.length ? (
        <p className="dashboard-muted">Nothing to show yet.</p>
      ) : (
        <ul className="dashboard-list">
          {state.data.map((record, index) => (
            <li key={record.id ?? `${title}-${index}`}>
              <strong>{displayName(record)}</strong>
              {displayDetail(record) && (
                <span className="dashboard-muted">{displayDetail(record)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [dashboardResult, setDashboardResult] = useState({ userId: null, data: {} });
  const [loggingOut, setLoggingOut] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let active = true;
    const entries = Object.entries(LOADERS);

    Promise.all(
      entries.map(async ([key, load]) => {
        try {
          const result = await load();
          return [key, { loading: false, data: result, error: "" }];
        } catch (error) {
          return [
            key,
            {
              loading: false,
              data: null,
              error: error.message || "Unable to load this section.",
            },
          ];
        }
      }),
    ).then((results) => {
      if (active) {
        setDashboardResult({
          userId: user?.id ?? null,
          data: Object.fromEntries(results),
        });
      }
    });

    return () => {
      active = false;
    };
  }, [user?.id]);

  async function handleLogout() {
    setDashboardError("");
    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      setDashboardError(error.message || "Unable to log out.");
      setLoggingOut(false);
    }
  }

  const loading = !user?.id || dashboardResult.userId !== user.id;
  const data = loading ? {} : dashboardResult.data;
  const profile = data.profile?.data;
  const academics = data.academics?.data ?? [];
  const attendance = data.attendance?.data ?? [];
  const career = data.career?.data;
  const profileError = data.profile?.error;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">EDU PLUS · STUDENT</p>
          <h1>{profile?.name || (data.profile?.loading ? "Loading your dashboard…" : "Student dashboard")}</h1>
          <p className="dashboard-muted">{user?.email}</p>
        </div>
        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Signing out…" : "Log out"}
        </button>
      </header>

      {dashboardError && <p className="dashboard-error" role="alert">{dashboardError}</p>}
      {loading && <p className="dashboard-loading" role="status">Loading your student information…</p>}
      {!loading && profileError && (
        <p className="dashboard-error" role="alert">
          Unable to load your student profile: {profileError}
        </p>
      )}
      {!loading && !profileError && !profile && (
        <p className="dashboard-empty">No student profile is linked to this account yet.</p>
      )}

      <section className="dashboard-summary" aria-label="Academic summary">
        <SummaryCard label="Department" value={profile?.department} loading={data.profile?.loading} />
        <SummaryCard label="Year" value={profile?.year} loading={data.profile?.loading} />
        <SummaryCard label="Semester" value={profile?.semester} loading={data.profile?.loading} />
        <SummaryCard label="CGPA" value={getCgpa(profile, academics)} loading={data.profile?.loading || data.academics?.loading} />
        <SummaryCard label="Attendance" value={getAttendanceSummary(attendance)} loading={data.attendance?.loading} />
      </section>
      {data.academics?.error && (
        <p className="dashboard-error" role="alert">
          Unable to load CGPA information: {data.academics.error}
        </p>
      )}
      {data.attendance?.error && (
        <p className="dashboard-error" role="alert">
          Unable to load attendance: {data.attendance.error}
        </p>
      )}

      {data.career?.loading ? (
        <section className="dashboard-card">
          <h2>Career direction</h2>
          <p className="dashboard-muted" role="status">Loading career details…</p>
        </section>
      ) : data.career?.error ? (
        <section className="dashboard-card">
          <h2>Career direction</h2>
          <p className="dashboard-error" role="alert">{data.career.error}</p>
        </section>
      ) : (
        <section className="dashboard-card career-summary">
          <h2>Career direction</h2>
          <p><strong>Career goal:</strong> {textValue(career?.career_goal ?? career?.goal) || "Not added yet"}</p>
          <p><strong>Target role:</strong> {textValue(career?.target_role ?? career?.desired_role) || "Not added yet"}</p>
        </section>
      )}

      <section className="dashboard-grid" aria-label="Student information">
        {SECTIONS.map(({ key, title }) => (
          <SectionCard key={key} title={title} state={data[key]} />
        ))}
      </section>
    </main>
  );
}

function SummaryCard({ label, value, loading: isLoading }) {
  return (
    <section className="summary-card">
      <span>{label}</span>
      <strong>
        {isLoading ? "Loading…" : value === null || value === undefined || value === "" ? "—" : textValue(value)}
      </strong>
    </section>
  );
}
