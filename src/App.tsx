import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import "./App.css";

function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";

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
