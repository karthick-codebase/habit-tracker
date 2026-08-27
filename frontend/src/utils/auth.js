const TOKEN_KEY = "token";
const USER_KEY = "user";

export const saveAuth = (token, user) => {
  if (!token) {
    throw new Error("Authentication token is required.");
  }

  localStorage.setItem(TOKEN_KEY, token);

  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error(
      "Failed to parse stored user:",
      error
    );

    localStorage.removeItem(USER_KEY);

    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};