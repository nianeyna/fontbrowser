import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <nav>
        <ul>
          <li><NavLink to={'/'}>Home</NavLink></li>
          <li><NavLink to={'settings'}>Settings</NavLink></li>
        </ul>
      </nav>
      <Outlet />
    </>
  );
}
