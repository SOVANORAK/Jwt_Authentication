/* eslint-disable no-unused-vars */
import { useState } from "react";
import "./App.css";
import axios from "axios";
//import { jwtDecode } from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Refresh Token
  const refreshToken = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/refresh", {
        token: user.refreshToken,
      });
      setUser({
        ...user,
        acsessToken: res.data.acsessToken,
        refreshToken: res.data.refreshToken,
      });
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };
  // End Refresh Token

  // Auto Refresh Token

  // const axiosJWT = axios.create();

  // axiosJWT.interceptors.request.use(
  //   async (config) => {
  //     let currentDate = new Date();
  //     const decodedToken = jwtDecode(user.accessToken);
  //     if (decodedToken.exp * 1000 < currentDate.getTime()) {
  //       const data = await refreshToken();
  //       config.headers["authorization"] = "Bearer " + data.accessToken;
  //     }
  //     return config;
  //   },
  //   (error) => {
  //     return Promise.reject(error);
  //   }
  // );

  // End Auto Refresh Token

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        username,
        password,
      });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  // End Handle Login

  // Handle Delete
  const handleDelete = async (id) => {
    setError(false);
    setSuccess(false);
    try {
      await axios.delete("http://localhost:3000/api/users/" + id, {
        headers: {
          authorization: "Bearer " + user.acsessToken,
        },
      });
      setSuccess(true);
    } catch (err) {
      setError(true);
    }
  };
  // End Handle Delete

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete John
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Jane
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <div className="form">
            <span className="formTitle">Norak Login</span>
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="submitButton" onClick={handleSubmit}>
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
