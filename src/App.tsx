import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route path="/register" element={<p>Register page</p>} />
      <Route path="/forbidden" element={<p>Access denied</p>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/account" element={<p>Account page</p>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<p>Admin page</p>} />
      </Route>

      <Route path="/" element={<Navigate to="/account" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
