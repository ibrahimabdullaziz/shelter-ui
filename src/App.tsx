import { AnimatePresence } from "motion/react";
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
  const location = useLocation();
  const { pathname } = location;
  const isAuthPage = authPaths.has(pathname);

  if (isAuthPage) return <Outlet />;

  return (
    <div className="site-shell">
      <Navbar />
      <div className="site-content">
        <AnimatePresence mode="wait" initial={false}>
          <Outlet key={pathname} />
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

export default App;
