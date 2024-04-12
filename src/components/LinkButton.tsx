import { NavLink } from "react-router-dom";

type LinkButtonProps = {
  label: string;
  to: string;
  className?: string;
};

export const LinkButton = ({
  label,
  to,
  className = "link-btn",
}: LinkButtonProps) => (
  <NavLink to={to} className={className}>
    {label}
  </NavLink>
);
