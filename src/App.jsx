import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import { RequireRole, RedirectAuthenticatedUser } from "./components/RouteGuards";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function HomeRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <main className="page-state" role="status">Checking your session…</main>;
  }

  return <Navigate to={user && role ? `/${role}` : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<RedirectAuthenticatedUser />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<RequireRole allowedRoles={["student"]} />}>
        <Route path="/student" element={<StudentDashboard />} />
      </Route>
      <Route element={<RequireRole allowedRoles={["staff"]} />}>
        <Route path="/staff" element={<StaffDashboard />} />
      </Route>
      <Route element={<RequireRole allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
