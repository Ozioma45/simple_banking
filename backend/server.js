const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const { pool } = require("./dbconfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
dotenv.config();

const initializePassport = require("./passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/static", express.static(path.join(__dirname, "../frontend")));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/register.html"));
});

app.get("/reset", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/reset.html"));
});

app.get("/dashboard", checkNotAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user.name });
});

app.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
});

app.post("/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;

  console.log({
    name,
    email,
    password,
    password2,
  });

  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password should be at least 6 characters" });
  }

  if (password != password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    return res.redirect(
      `/register?errors=${encodeURIComponent(JSON.stringify(errors))}`
    );
  }

  try {
    //form validation passed
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      errors.push({ message: "Email already registered" });
      return res.redirect(
        `/register?errors=${encodeURIComponent(JSON.stringify(errors))}`
      );
    }

    // Proceed with inserting the new user into the database
    await pool.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password`,
      [name, email, hashedPassword]
    );
    console.log(result.rows);
    req.flash("success_msg", "You are now registered. Please log in");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect('/register?errors=[{"message":"Something went wrong"}]');
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }

  next();
}

function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  next();
}

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
