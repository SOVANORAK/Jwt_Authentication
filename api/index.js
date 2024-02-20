const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const PORT = 3000;

app.use(cors());
app.use(express.json());

//USER DATA
const users = [
  {
    id: "1",
    username: "jonh",
    password: "Jonh0908",
    isAdmin: true,
  },
  {
    id: "2",
    username: "jane",
    password: "Jane0908",
    isAdmin: false,
  },
];

//Store Refresh token in array
let refreshTokens = [];

//Generate AccessToken
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
    expiresIn: "15m",
  });
};

//Generate RefreshToken
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

//Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  if (user) {
    const acsessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    //After generate refreshToken Push refresh token into array
    refreshTokens.push(refreshToken);

    res.json({
      message: "Login Successfully.",
      username: user.username,
      isAdmin: user.isAdmin,
      acsessToken: acsessToken,
      refreshToken: refreshToken,
    });
  } else {
    res.status(400).json("Username or password is incorrect!");
  }
});

//Refresh Token

app.post("/api/refresh", (req, res) => {
  //Take the refresh token from user
  const refreshToken = req.body.token;
  //Send error if no token or token is not valid
  if (!refreshToken) {
    return res.status(401).json("Unauthorized");
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }

  //If everything is okay, create new acccess token
  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    if (err) console.log(err);
    //delete old token in array
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    //Generate new token
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    //Push new refresh token into array
    refreshTokens.push(newRefreshToken);
    res.status(200).json({
      acsessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

//Verify Token User
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; //to get token after Bearer

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated");
  }
};

//Delete
app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

//Log out
app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken); //remove refresh token from array
  res.status(200).json("You loggout successfully!");
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
