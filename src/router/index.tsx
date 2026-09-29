import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import BookingConfirmationPage from "../pages/BookingConfirmation";
import {
  HostBookingsPage,
  HostOverviewPage,
  HostUnitsPage,
} from "../pages/HostDashboard";
import HostDashboard from "../pages/HostDashboard";
import MyBookingsPage from "../pages/MyBookings";
import UnitDetailPage from "../pages/UnitDetail";
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
          {
            path: "bookings/:id/confirmation",
            element: <BookingConfirmationPage />,
          },
          { path: "bookings", element: <MyBookingsPage /> },
          {
            element: <ProtectedRoute allowedRoles={["HOST", "ADMIN"]} />,
            children: [
              {
                path: "host",
                element: <HostDashboard />,
                children: [
                  { index: true, element: <HostOverviewPage /> },
                  { path: "units", element: <HostUnitsPage /> },
                  { path: "bookings", element: <HostBookingsPage /> },
                ],
              },
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
      { path: "units/:id", element: <UnitDetailPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
