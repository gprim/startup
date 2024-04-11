import { NavLink } from "react-router-dom";

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
  return (
    <header>
      <h1>Cazi Games</h1>
      <nav>
        <menu>
          <Link to="/" label="Home" />
          <Link to="/login" label="Login" />
          <Link to="/messages" label="Messages" />
          <Link to="/games" label="Games" />
        </menu>
      </nav>
    </header>
  );
};
