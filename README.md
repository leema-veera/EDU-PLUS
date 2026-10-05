# EDU PLUS frontend services

The app uses the Supabase client in `src/lib/supabase.js` with the public
project URL and anon/publishable key. Vite is configured to load these variables
from the workspace root `.env` file (one directory above `edu-plus`):

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not put a Supabase service-role key in frontend environment variables. All
database and Storage access uses the signed-in Supabase user's session and is
subject to the project's Row Level Security (RLS) policies.
If these public Supabase variables are missing, the app displays a setup
message instead of failing before React renders. Restart Vite after changing
the `.env` file.

## Service modules

| Module | Supabase resource |
| --- | --- |
| `authService.js`, `roleService.js` | Supabase Auth and the authenticated user's `profiles.role` |
| `studentService.js` | `student_profiles` |
| `academicService.js` | `academics` |
| `attendanceService.js` | `attendance` |
| `skillService.js` | `skills` |
| `projectService.js` | `projects` |
| `certificationService.js` | `certifications` |
| `internshipService.js` | `internships` |
| `achievementService.js` | `achievements` |
| `careerService.js` | `career_profiles` |
| `mentorAssignmentService.js` | `mentor_assignments` and related profiles |
| `aiInsightService.js` | `ai_insights` (persisted insights; no client-side AI generation) |
| `studentReportService.js` | `student_reports` |
| `resourceService.js` | `resources` and the `learning-materials` bucket |
| `questionPaperService.js` | `question_papers` and the `question-papers` bucket |
| `notificationService.js` | `notifications` |
| `eventService.js` | `events` |
| `storageService.js` | Supabase Storage |

The repository contains partial service code for the core tables, but no SQL
schema for the newly covered domains. Confirm the additional table names,
columns (`created_at`, `user_id`, `is_read`), relationships, and profile-role
mapping against the deployed Supabase schema before using those modules. Adjust
service queries to match that schema; no tables, RPCs, or backend APIs are
created or emulated here.

## Access and UI state

Student-owned writes resolve `student_id` from the authenticated user's
`student_profiles` row and ignore any caller-provided `student_id`. The
`*ForStudent` methods support staff workflows, but the database must enforce
that staff can access only assigned students. Reads and mutations for other
users are likewise never authorized by a frontend-selected role: use the
authenticated user's `profiles.role` only to display role-specific UI; enforce
permissions in RLS.

List methods return an empty array when there are no visible rows; optional
single-row reads return `null` when no visible row exists. Most data-service
errors reject their promises. Authentication methods return
`{ success, data, error }` results instead. React callers should keep loading
state while awaiting a request and display failures instead of treating them as
empty data.

## Authentication and routes

`src/main.jsx` mounts React Router and the Supabase-backed `AuthProvider`.
`/login`, `/student`, `/staff`, and `/admin` are role-gated routes. The provider
waits for Supabase's persisted auth session, verifies the current user, then
loads `profiles.role` for the authenticated user's `profiles.id`. The login
page does not accept a role; successful sign-in redirects according to that
database value. A role mismatch redirects to the user's own route, and logout
uses Supabase Auth to clear the persisted session.

The student route renders `src/pages/StudentDashboard.jsx`, which loads the
signed-in student's profile and private records through the corresponding
`getMy...`/no-ID service methods. Shared resources, question papers, and events
are queried with the authenticated session and are limited by their deployed
RLS policies. Dashboard sections show loading, empty, or error states
independently. The display uses common profile/record fields (such as `name`,
`department`, `year`, `semester`, `cgpa`, and `target_role`); confirm actual
column names and attendance/CGPA formats against the deployed schema.

The staff route renders `src/pages/StaffDashboard.jsx`. It gets active
assignments through `getMyMentees()` and only requests student detail after
selecting a student returned by that query. `mentor_assignments` and every
student-record table must have deployed RLS policies tied to `auth.uid()` and
the authenticated staff member's active assignments. The assignment query
filters `mentor_assignments.mentor_id` to the authenticated user's ID; this
assumes staff profile IDs are the corresponding Auth user IDs. The service and
dashboard do not provide or replace database policies; verify that unassigned
students are denied at the Supabase API, not only hidden in the UI.

The admin route renders `src/pages/AdminDashboard.jsx` and provides profile,
student, staff, assignment, content-record, and Storage management. The admin
services verify the current user's `profiles.role` before issuing operations;
the Supabase session is still used for every request. Actual authorization must
be enforced by RLS policies on `profiles`, `student_profiles`,
`staff_profiles`, `mentor_assignments`, `resources`, `question_papers`,
`notifications`, `events`, and the relevant Storage buckets. No schema or
policy migrations are included, so confirm or deploy admin-only policies
against the real database before enabling writes. User listing reads profile
rows, not the protected Supabase Auth user directory.

The role lookup assumes `profiles.id` is the matching `auth.users.id` and
`profiles.role` contains `student`, `staff`, or `admin`. Adjust the query if the
deployed profile schema uses a different authenticated-user foreign key. Route
guards are a frontend UX boundary, not a replacement for RLS policies on
database tables or Storage buckets.
