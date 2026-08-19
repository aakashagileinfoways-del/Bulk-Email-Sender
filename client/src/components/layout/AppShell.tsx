import { NavLink, Outlet } from "react-router-dom";
import { BrandMark } from "./BrandMark";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export const AppShell = () => (
  <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <BrandMark />
        <div>
          <h1>Dispatch</h1>
          <p>Bulk email</p>
        </div>
      </div>
      <nav className="nav">
        <NavLink to="/" className={navClassName} end>
          Compose
        </NavLink>
        <NavLink to="/providers" className={navClassName}>
          SMTP
        </NavLink>
      </nav>
    </aside>
    <main className="main">
      <Outlet />
    </main>
  </div>
);
