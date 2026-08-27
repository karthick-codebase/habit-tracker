import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="text-center">
        <div className="mb-4 text-7xl font-bold">404</div>

        <h1 className="text-2xl font-semibold">Page not found</h1>

        <p className="mt-2 text-sm text-slate-400">
          The page you are looking for does not exist.
        </p>

        <a
          href="/login"
          className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          Go to Login
        </a>
      </div>
    </main>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3500,

          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            background: "#0f172a",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.08)",
          },

          success: {
            duration: 3000,
          },

          error: {
            duration: 4000,
          },
        }}
      />

      <Routes>
        {/* =====================================
            PUBLIC ROUTES
        ====================================== */}

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* =====================================
            PROTECTED ROUTES

            Dashboard will be added here later.
        ====================================== */}

        <Route element={<ProtectedRoute />}>
          {/* Dashboard comes next */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* =====================================
            HOME
        ====================================== */}

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* =====================================
            404
        ====================================== */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
