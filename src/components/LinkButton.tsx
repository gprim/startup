import { NavLink } from "react-router-dom";

type LinkButtonProps = {
  label: string;
  to: string;
  className?: string;
};

export const LinkButton = ({
  label,
  to,
  className = "nav-button",
}: LinkButtonProps) => (
  <NavLink to={to} className={className}>
    {label}
  </NavLink>
);
