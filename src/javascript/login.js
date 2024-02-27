import { login } from "./account.js"

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", e => {
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
    
    const token = login(username, password)

    if (!token) {
        alert("Incorrect login!");
        return;
    }
});
