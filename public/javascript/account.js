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

const deleteCurrentToken = () => {
  localStorage.removeItem("currentToken");
};

export const getCurrentToken = () => {
  return localStorage.getItem("currentToken") || undefined;
};

const deleteCurrentUser = () => {
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = () => {
  return getFromLocalStorage("currentUser", null);
};

const storeCurrentToken = (token) => {
  localStorage.setItem("currentToken", token);
};

const storeCurrentUser = (user) => {
  storeOnLocalStorage("currentUser", { ...user, password: undefined });
};

const saveUser = (user, token) => {
  storeCurrentToken(token);

  storeCurrentUser(user);

  return token;
};

const checkToken = async () => {
  const token = getCurrentToken();
  if (!token) {
    deleteCurrentUser();
    return;
  }

  const response = await get("/api/auth", { authorization: token });

  if (!response.ok) {
    deleteCurrentToken();
    deleteCurrentUser();
  }
};

export const createAccount = async (email, username, password) => {
  const user = { email, username, password };

  let token;

  try {
    const response = await post("/api/auth", user);
    if (response.status === 401) {
      alert(`Username ${username} already taken`);
      return;
    }
    token = await response.text();
  } catch (ex) {
    alert(ex.message);
    return;
  }

  saveUser(user, token);

  return token;
};

export const login = async (username, password) => {
  const user = { username, password };

  let token;

  try {
    const response = await put("/api/auth", user);
    if (response.status === 401) {
      alert("Wrong username or password");
      return;
    }
    token = await response.text();
  } catch (ex) {
    alert(ex.message);
    return;
  }

  saveUser(user, token);

  return token;
};

await checkToken();
