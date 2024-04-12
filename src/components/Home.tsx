import { useContext } from "react";
import { AuthContext } from "../context";
import { LinkButton } from "./LinkButton";

export const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1>Welcome to Cazi-Games!</h1>
      {user ? (
        <>
          <LinkButton to="/messages" label="Message Friends" />
          <LinkButton to="/games" label="Play some games" />
        </>
      ) : (
        <>
          <LinkButton to="/login" label="Login" /> Or{" "}
          <LinkButton to="/create-account" label="Create an account" />
        </>
      )}
    </>
  );
};
