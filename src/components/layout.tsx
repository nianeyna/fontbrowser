import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="m-3">
      <nav className="mb-3 border-0 border-b border-black">
        <ul>
          <li className="inline mr-3"><NavLink to={'/'}>Home</NavLink></li>
          <li className="inline mr-3"><NavLink to={'settings'}>Settings</NavLink></li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
