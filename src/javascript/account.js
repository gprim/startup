const getFromLocalStorage = (key, defaultValue = {}) => {
  let value = localStorage.getItem(key);

  if (!value) value = defaultValue;
  else value = JSON.parse(value);

  return value;
};

const storeOnLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getAccounts = () => {
  return getFromLocalStorage("accounts");
};

const getTokens = () => {
  return getFromLocalStorage("tokens");
};

const storeAccounts = (accounts) => {
  storeOnLocalStorage("accounts", accounts);
};

const storeTokens = (tokens) => {
  storeOnLocalStorage("tokens", tokens);
};

const authenticateUser = (user) => {
  const tokens = getTokens();

  const token = crypto.randomUUID();

  tokens[token] = user.username;
  storeTokens(tokens);

  return token;
};

export const createAccount = (email, username, password) => {
  const accounts = getAccounts();

  if (accounts[username]) throw new Error("Account already exists!");

  accounts[username] = { email, username, password };

  storeAccounts(accounts);

  return authenticateUser(accounts[username]);
};

export const login = (username, password) => {
  const accounts = getAccounts();

  if (!accounts[username] || accounts[username].password !== password)
    return undefined;

  return authenticateUser(accounts[username]);
};
