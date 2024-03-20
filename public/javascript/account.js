import { get, post, put } from "./api.js";

export const getFromLocalStorage = (key, defaultValue = {}) => {
  let value = localStorage.getItem(key);

  if (!value) value = defaultValue;
  else value = JSON.parse(value);

  return value;
};

export const storeOnLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const deleteCurrentUser = () => {
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = () => {
  return getFromLocalStorage("currentUser", null);
};

const storeCurrentUser = (user) => {
  storeOnLocalStorage("currentUser", { ...user, password: undefined });
};

const saveUser = (user) => {
  storeCurrentUser(user);
};

const checkToken = async () => {
  const response = await get("/api/auth");

  if (!response.ok) {
    deleteCurrentUser();
  }
};

export const createAccount = async (email, username, password) => {
  const user = { email, username, password };

  try {
    const response = await post("/api/auth", user);
    if (response.status === 401) {
      alert(`Username ${username} already taken`);
      return;
    }
  } catch (ex) {
    alert(ex.message);
    return;
  }

  saveUser(user);
};

export const login = async (username, password) => {
  const user = { username, password };

  try {
    const response = await put("/api/auth", user);
    if (response.status === 401) {
      alert("Wrong username or password");
      return;
    }
  } catch (ex) {
    alert(ex.message);
    return;
  }

  saveUser(user);
};

await checkToken();
