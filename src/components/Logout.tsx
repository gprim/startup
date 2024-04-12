import { useContext } from "react";
import { AuthContext } from "../context";

export const Logout = () => {
  const { logout } = useContext(AuthContext);

  const onLogoutClicked = async () => {
    const success = await logout();

    if (!success) {
      alert("Something went wrong");
      return;
    }

    window.location.href = window.location.origin;
  };

  return (
    <>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "50px",
        }}
      >
        Are you sure you want to log out?{" "}
        <div className="link-btn" onClick={onLogoutClicked}>
          Log me out
        </div>
      </div>
    </>
  );
};
