import { getCurrentUser } from "./account.js";

const user = getCurrentUser();

console.log(user);

const loggedInContent = document.getElementById("logged-in");
const notLoggedInContent = document.getElementById("not-logged-in");

if (!user) notLoggedInContent.style.display = "block";
else {
  loggedInContent.style.display = "block";
  const welcomeUser = document.getElementById("welcome-user");
  welcomeUser.textContent = `Welcome ${user.username}!`;
}
