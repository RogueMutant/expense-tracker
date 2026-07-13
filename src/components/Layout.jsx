import { NavLink } from "react-router-dom";

export default function Layout({ children, onLogout }) {
  return (
    <div className="app-layout">
      <button className="logout-btn" onClick={onLogout}>
        Log out
      </button>
      {children}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="nav-icon">&#9776;</span>
          <span>Log</span>
        </NavLink>
        <NavLink to="/new" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="nav-icon">+</span>
          <span>Add Slip</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="nav-icon">&#9650;</span>
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
          <span className="nav-icon">&#9881;</span>
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}
