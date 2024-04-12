import { useContext } from "react";
import { LinkButton } from "./LinkButton";
import { AuthContext } from "../context";

export const CreateAccount = () => {
  const { createAccount } = useContext(AuthContext);

  const submitCreateAccount: React.FormEventHandler<HTMLFormElement> = async (
    e,
  ) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);

    let username = "";
    let password = "";
    let email = "";

    for (const [name, value] of form.entries()) {
      switch (name) {
        case "username":
          username = value.toString();
          break;
        case "password":
          password = value.toString();
          break;
        case "email":
          email = value.toString();
          break;
      }
    }

    if (!username || !password || !email) {
      alert("You must provide a username and password");
      return;
    }

    username.trim();
    email.trim();

    if (username.includes(" ")) {
      alert("No spaces allowed in username");
      return;
    } else if (email.includes(" ")) {
      alert("No spaces allowed in email");
      return;
    }

    let success = false;

    try {
      success = await createAccount(username, password, email);
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
      return;
    }

    if (success) window.location.href = window.location.origin;
    else alert("Username already taken");
  };
  return (
    <>
      <form
        id="create-account-form"
        className="session-form"
        method="get"
        action="index.html"
        onSubmit={submitCreateAccount}
      >
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          required
          placeholder="Email"
        />
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          required
          placeholder="Username"
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          required
          placeholder="Password"
        />
        <button className="link-btn" type="submit">
          Login
        </button>
      </form>
      <p>
        Already have an account?
        <LinkButton label="Login" to="/login" className="link-btn" />
      </p>
    </>
  );
};
