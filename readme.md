# TrustBank Authentication System

## Overview

TrustBank is a user authentication system built using **Node.js, Express, PostgreSQL, and Passport.js**. It provides essential authentication functionalities, including:

- User registration
- User login with session management
- Password reset functionality
- Secure password storage using bcrypt

## Features

- **User Authentication:** Secure login and registration with password hashing.
- **Session Management:** Uses express-session and Passport.js.
- **Password Reset:** Users can reset their password when they forget it.
- **Flash Messages:** Feedback messages for success or errors.
- **Secure Routes:** Ensures that only authenticated users can access the dashboard.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS
- **Database:** PostgreSQL
- **Authentication:** Passport.js, bcrypt
- **Session Management:** express-session
- **Templating Engine:** EJS (previously, now static HTML)

## Database Setup

Ensure you have PostgreSQL installed and running. Create a database named `trustbank_db` and set up a `users` table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token TEXT,
    reset_token_expiry TIMESTAMP
);
```

## Installation & Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/Ozioma45/simple_banking.git
   cd simple_banking
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables (`.env` file):
   ```env
   PORT=4000
   DATABASE_URL=postgres://username:password@localhost:5432/trustbank_db
   SESSION_SECRET=your_secret_key
   ```
4. Start the server:
   ```sh
   npm start
   ```
5. Open `http://localhost:4000` in your browser.

## Routes

### Authentication Routes

- `POST /register` → Register a new user
- `POST /login` → Authenticate user
- `GET /logout` → Logout user

### Password Reset Routes

- `POST /reset-request` → Send password reset email
- `POST /reset-password` → Reset password with token

## Security Considerations

- Passwords are securely hashed using bcrypt.
- Sessions are used to manage user authentication.
- Reset tokens expire after a set time.
- User input is validated before processing.

## Future Improvements

- Implement email notifications for password reset.
- Add two-factor authentication (2FA).
- Improve UI with frontend frameworks.

## Author

- **Ozioma Egole** - [GitHub](https://github.com/ozioma45)

## License

This project is licensed under the MIT License.
