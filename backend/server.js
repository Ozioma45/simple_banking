const express = require("express");

//for reset password
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// Step 2: Serve reset password form
app.get("/reset-password", (req, res) => {
  const { token } = req.query;
  res.sendFile(path.join(__dirname, "../frontend/reset-password.html"));
});

// Step 3: Handle new password submission
app.post("/reset-password", async (req, res) => {
  const { token, password, password2 } = req.body;

  if (password !== password2) {
    req.flash("error_msg", "Passwords do not match!");
    return res.redirect(`/reset-password?token=${token}`);
  }

  try {
    // Find user by token
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > $2",
      [token, Date.now()]
    );

    if (result.rows.length === 0) {
      req.flash("error_msg", "Invalid or expired token.");
      return res.redirect("/reset");
    }

    const user = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    req.flash("success_msg", "Password successfully updated! Please log in.");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.redirect("/reset");
  }
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

// Step 1: Handle password reset request
app.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email exists
    pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
      async (err, results) => {
        if (err) throw err;

        if (results.rows.length === 0) {
          req.flash("error_msg", "Email not found!");
          return res.redirect("/reset");
        }

        // Generate a reset token
        const token = crypto.randomBytes(20).toString("hex");
        const expires = Date.now() + 15 * 60 * 1000; // Token expires in 15 mins

        // Store token in the database
        await pool.query(
          "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3",
          [token, expires, email]
        );

        // Send reset link via email
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "oziomaegole@gmail.com",
            pass: "pxuy tsun hsua wzlm",
          },
        });

        const mailOptions = {
          to: email,
          from: "no-reply@trustbank.com",
          subject: "Password Reset Request",
          text: `You requested a password reset. Click the link below to reset your password:\n\n
        http://localhost:5000/reset-password?token=${token}\n\n
        This link will expire in 15 minutes.`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) throw err;
          req.flash("success_msg", "Password reset link sent to your email.");
          res.redirect("/login");
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.redirect("/reset");
  }
});

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
