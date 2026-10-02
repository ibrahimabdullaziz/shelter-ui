import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import "./App.css";

const authPaths = new Set([
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
]);

function App() {
  const { pathname } = useLocation();
  const isAuthPage = authPaths.has(pathname);

  if (isAuthPage) return <Outlet />;

  return (
    <div className="site-shell">
      <Navbar />
      <div className="site-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default App;
