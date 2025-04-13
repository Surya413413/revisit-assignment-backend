const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt")
const {open} = require("sqlite");
const sqlite3 = require("sqlite3")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(cors())

const dbpath = path.join(__dirname, "cloths.db");

let db = null;

const initialization = async () => {
    try{
        db = await open({
            filename:dbpath,
            driver: sqlite3.Database
        })
        app.listen(3000, ()=> {
            console.log("server running on 3000 port")
        })

    }catch(e){
        console.log(`error occurs in db: ${e.message}`)
        process.exit(1)

    }

}
initialization()

//userRegister
app.post("/users/register", async (request,response) => {
    const {name,email,password,} = request.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const userQuery = `
    SELECT * FROM users WHERE name = '${name}';
    `;
    const dbUser = await db.get(userQuery);
    if (dbUser === undefined){
        //create user in userdetails
        const createQuery = `
        INSERT INTO users (name,email,password) VALUES ('${name}','${email}','${hashedPassword}');
        `;
        await db.run(createQuery)
        response.status(201).json({ message: "User created successfully" });
    } 
    else{

  // handle user error
    response.status(400)
    response.send("Email id already created")
    }
})

//login user 
app.post("/users/login", async (request,response) => {
    const {email,password} = request.body;
    const userQuery = `
    SELECT * FROM users WHERE email = '${email}';
    `;
    const dbUser = await db.get(userQuery);
    console.log(dbUser)
    if (dbUser === undefined){
        // user doesnt exit
        return response.status(400).send("Invalid user login");
      
       
    }else{
  // campare password
  const isPasswordMatched = await bcrypt.compare(password,dbUser.password)
  if (isPasswordMatched === true){
    const playload = {id: dbUser.id, username:dbUser.name};
    const jwtToken = jwt.sign(playload,"cloths@413");
    //response.status(400)
    response.json({ token: jwtToken });

  }else{
    return response.status(400).send("Invalid password");

  }
    
    }
})

// authentication user 

const actunticationjwtToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    
    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1];
    }
    
    if (jwtToken === undefined) {
        return response.status(401).send("User unauthorized");
    } else {
        jwt.verify(jwtToken, "cloths@413", async (error, payload) => {
            if (error) {
                return response.status(401).send("Invalid access token");
            } else {
                // Log the payload to ensure it contains the user ID
                console.log("Decoded payload: ", payload);
                
                if (!payload || !payload.id) {
                    return response.status(400).send("User ID is missing. Authentication failed.");
                }
                
                // request.userId = payload.id;
                // console.log("User ID: ", request.userId);  // Log to verify the userId
                request.userId = payload.id;
                request.username = payload.username; // Add username to request object
                console.log("User ID: ", request.userId, "Username: ", request.username);
                next();
                
            }
        });
    }
};

// profile
app.get("/profile", actunticationjwtToken, (request, response) => {
    const { username } = request;
    // Send the username in the response
    return response.status(200).json({ username });
});

//get categories
app.get('/categories',actunticationjwtToken , async (req, res) => {
    const items = await db.all(`SELECT * FROM categories WHERE user_id = ? ORDER BY item_count DESC, created_at DESC`, [req.userId]);
    res.json(items);
});


app.get('/categories/:id',actunticationjwtToken , async (req, res) => {
    try {
        const { id } = req.params;

        // Secure query using parameterized values to prevent SQL injection
        const item = await db.get("SELECT * FROM categories WHERE id = ?", [id]);

        if (!item) {
            return res.status(404).json({ error: "item not found" });
        }

        res.json(item);
    } catch (error) {
        console.error("Error fetching item:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Create categories
app.post('/categories/create',actunticationjwtToken , async (req, res) => {
    const { name, item_count, image_url } = req.body;

    // Debugging: Log user ID to confirm it's correctly extracted
    console.log("User ID from Token:", req.userId); 

    if (!req.userId) {
        return res.status(400).json({ error: "User ID is missing. Authentication failed." });
    }

    try {
        const result = await db.run(
            `INSERT INTO categories (name, item_count, image_url, created_at, updated_at, user_id) 
             VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`,
            [name, item_count, image_url, req.userId]
        );

        const newItem = await db.get(`SELECT * FROM categories WHERE id = ?`, [result.lastID]);

        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error inserting Item:", error);
        res.status(500).json({ error: "Error creating Item" });
    }
});


//put method update

app.put("/categories/:id",actunticationjwtToken , async(req,res) => {
    const {name,item_count,image_url} = req.body;
    const {id} = req.params;
    const adduser = `
    UPDATE categories SET name = '${name}', item_count = '${item_count}', image_url='${image_url}' WHERE id = ${id};`;
    const userresponse = await db.run(adduser)
    //const updateId = userresponse.lastId
    res.json({ message: "success updated" });
})


// detele 
app.delete("/categories/:id",actunticationjwtToken, async (request,response) => {
    const {id} = request.params
    const deleteuser = `
    DELETE FROM categories WHERE id = ${id};
    `;
    const userresponse = await db.run(deleteuser)
    response.send("sucess deleted")

})
//delete all  
app.delete("/categories",actunticationjwtToken , async (request,response) => {
    const deleteuser = `
    DELETE FROM categories;
    `;
    const userresponse = await db.run(deleteuser)
    response.send("sucess deleted all")

})


module.exports = app

