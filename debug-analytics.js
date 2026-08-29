const axios = require("axios");

(async () => {
  const email = "analytics-debug-" + Date.now() + "@example.com";
  const password = "Password123!";
  const timezone = "UTC";

  console.log("REGISTERING...");
  try {
    const register = await axios.post(
      "http://localhost:5000/api/auth/register",
      { email, password, timezone },
    );
    console.log("REGISTER_OK", register.status, JSON.stringify(register.data));
  } catch (error) {
    console.log(
      "REGISTER_ERR",
      error.response && error.response.status,
      JSON.stringify(error.response && error.response.data),
    );
  }

  console.log("LOGGING_IN...");
  try {
    const login = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });
    console.log("LOGIN_OK", login.status, JSON.stringify(login.data));
    const token = login.data.data.token;

    const overview = await axios.get(
      "http://localhost:5000/api/analytics/overview",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("OVERVIEW_OK", JSON.stringify(overview.data));

    const daily = await axios.get("http://localhost:5000/api/analytics/daily", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("DAILY_OK", JSON.stringify(daily.data));

    const habits = await axios.get(
      "http://localhost:5000/api/analytics/habits",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log("HABITS_OK", JSON.stringify(habits.data));
  } catch (error) {
    console.log(
      "REQUEST_ERR",
      error.response && error.response.status,
      JSON.stringify(error.response && error.response.data),
    );
    console.log("REQUEST_MESSAGE", error.message);
    process.exitCode = 1;
  }
})();
