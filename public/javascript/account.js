import { post, put } from "./api.js";

export const getFromLocalStorage = (key, defaultValue = {}) => {
  let value = localStorage.getItem(key);

  if (!value) value = defaultValue;
  else value = JSON.parse(value);

  return value;
};

export const storeOnLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getCurrentToken = () => {
  return localStorage.getItem("currentToken") || undefined;
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

const authenticateUser = (user, token) => {
  storeCurrentToken(token);

  storeCurrentUser(user);

  return token;
};

export const createAccount = async (email, username, password) => {
  const user = { email, username, password };

  let response;

  try {
    response = await post("../api/auth", user);
  } catch (ex) {
    alert(ex.message);
  }

  return authenticateUser(user, response);
};

export const login = async (username, password) => {
  const user = { username, password };

  let response;

  try {
    response = await put("../api/auth", user);
  } catch (ex) {
    alert(ex.message);
  }

  return authenticateUser(user, response);
};
