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

  let success = false;

  try {
    success = await createAccount(email, username, password);
  } catch (err) {
    alert(err.message);
    return;
  }

  if (success) window.location.href = window.location.origin;
});
