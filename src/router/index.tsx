import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import {
  HostBookingsPage,
  HostDashboard,
  HostOverviewPage,
  HostUnitsPage,
} from "./hostPages";
import Login from "../pages/Login";
import Register from "../pages/Register";
import {
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "../pages/AuthFlows";
import BookingConfirmationPage from "../pages/BookingConfirmation";
import FavoritesPage from "../pages/FavoritesPage";
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
      { path: "verify-email", element: <VerifyEmailPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
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
          { path: "favorites", element: <FavoritesPage /> },
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
                element: (
                  <Suspense
                    fallback={
                      <main
                        className="route-state"
                        aria-busy="true"
                        aria-live="polite"
                      >
                        Loading host dashboard...
                      </main>
                    }
                  >
                    <HostDashboard />
                  </Suspense>
                ),
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
