import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import UnitsPage from "../pages/Units";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "403",
        element: (
          <main className="route-state">
            You do not have permission to view this page.
          </main>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "account", element: <p>Account page</p> },
          { path: "bookings", element: <p>Your bookings</p> },
          {
            element: <ProtectedRoute allowedRoles={["HOST", "ADMIN"]} />,
            children: [
              { path: "host", element: <p>Host dashboard</p> },
              { path: "host/units", element: <p>Your listings</p> },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [{ path: "admin", element: <p>Admin dashboard</p> }],
          },
        ],
      },
      { index: true, element: <UnitsPage /> },
      { path: "units", element: <UnitsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
