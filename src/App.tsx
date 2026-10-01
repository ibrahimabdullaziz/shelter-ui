import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import "./App.css";

function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Outlet />
    </>
  );
}

export default App;
