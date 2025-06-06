# Revisit Category Management Backend

This is the **backend service** for the Category Management Module of the Clothify admin panel. It provides user authentication and CRUD operations for managing product categories.

---

##  Tech Stack

- **Node.js**  
- **Express.js**  
- **SQLite** (via `sqlite3` and `sqlite`)  
- **JWT Authentication**  
- **bcrypt** for password hashing  
- **CORS** and **Middleware** for secure API access  

---

### Project Structure

/backend ├── cloths.db # SQLite database file ├── index.js # Main Express server and route handlers ├── package.json
└── README.md # This file


---

##  Features

-  User Registration & Login with JWT  
-  Secure JWT-protected Routes  
-  Create, Read, Update, Delete Categories  
-  Get Single Category by ID  
-  Delete All Categories (for testing/admin)  
-  Each user sees only their own categories  

---

##  Authentication Flow

- JWT token is issued on successful login.
- The token must be sent as a Bearer token in the `Authorization` header for protected routes.

---

## Installation & Running

```bash
# Clone the repository
git clone https://github.com/Surya413413/revisit-category-management-assignment-backend.git
cd revisit-category-management-assignment-backend

# Install dependencies
npm install

# Start the server
node index.js

### User Authentication
Method	Endpoint	Description
POST	/users/register	Register new user
POST	/users/login	Login & get JWT token
GET	/profile	Get username from token

### Category APIs (Protected)
Method	Endpoint	Description
GET	/categories	Get all user categories
GET	/categories/:id	Get category by ID
POST	/categories/create	Add new category
PUT	/categories/:id	Update category
DELETE	/categories/:id	Delete category by ID
DELETE	/categories	Delete all categories

 Notes
Passwords are hashed using bcrypt before storage.

JWT token is signed using "cloths@413" secret.

Ensure you pass the correct token for protected routes.

Uses parameterized queries to prevent SQL injection.
