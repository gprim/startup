import { login } from "./account.js";

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  let username, password;

  for (let [name, value] of form.entries()) {
    switch (name) {
      case "username":
        username = value;
        break;
      case "password":
        password = value;
        break;
    }
  }

  try {
    await login(username, password);
  } catch (err) {
    console.log(err);
    return;
  }

  window.location.href = window.location.origin;
});
