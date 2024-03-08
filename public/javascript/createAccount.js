import { createAccount } from "./account.js";

const loginForm = document.getElementById("create-account-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);

  let username, password, email;

  for (let [name, value] of form.entries()) {
    switch (name) {
      case "username":
        username = value;
        break;
      case "password":
        password = value;
        break;
      case "email":
        email = value;
        break;
    }
  }

  let token;

  try {
    token = await createAccount(email, username, password);
  } catch (err) {
    alert(err.message);
    return;
  }

  if (!token) {
    alert("Incorrect login!");
    return;
  }

  window.location.href = window.location.origin;
});
