import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import App from "./App.jsx";
import "./index.css";
import { supabase } from "./lib/supabase";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {supabase ? (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <main className="page-state" role="alert">
        <div>
          <h1>Supabase configuration missing</h1>
          <p>
            Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>
            {" "}to the workspace <code>.env</code> file, then restart the dev server.
          </p>
        </div>
      </main>
    )}
  </StrictMode>,
);
