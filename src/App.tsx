import { useLocation, useOutlet } from "react-router-dom";
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
  const outlet = useOutlet();
  const isAuthPage = authPaths.has(pathname);

  const routeContent = (
      <div
        className={isAuthPage ? "auth-route-transition" : "route-transition"}
        key={pathname}
      >
        {outlet}
      </div>
  );

  if (isAuthPage) return routeContent;

  return (
    <div className="site-shell">
      <Navbar />
      <div className="site-content">{routeContent}</div>
      <Footer />
    </div>
  );
}

export default App;
