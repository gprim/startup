import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context";

type LinkProps = {
  to: string;
  label: string;
};

const Link = ({ to, label }: LinkProps) => (
  <ul>
    <NavLink className="nav-link" to={to}>
      {label}
    </NavLink>
  </ul>
);

export const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header>
      <h1>Cazi Games</h1>
      <nav>
        <menu>
          <Link to="/" label="Home" />
          {!user ? (
            <Link to="/login" label="Login" />
          ) : (
            <Link to="/logout" label="Logout" />
          )}
          <Link to="/messages" label="Messages" />
          <Link to="/games" label="Games" />
        </menu>
      </nav>
    </header>
  );
};
