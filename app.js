const express = require("express");
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require("mongoose");
const multer = require('multer');
const employee = require("./models/Employee.js");
const Employee = require("./models/Employee.js");
const app = express();
const upload = multer({dest:"uploads/"});
const methodOverride=require("method-override")
const { Joi, employeeSchema } = require("./schema.js");


// Set up method-override
app.use(methodOverride('_method'));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/MernTestDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Using session middleware for storing the user session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost:27017/MernTestDatabase', // MongoDB connection URL
    collectionName: 'sessions' // Name of the collection to store sessions
}),
  cookie: { maxAge: 60000 } // Session will expire after 1 minute (adjust as needed)
}));



app.get("/",(req,res)=>{
  res.redirect("/login");
})

// Routes
app.get("/login", (req, res) => {
// Check if user is already logged in
if (req.session && req.session.user) {
  return res.redirect('/dashboard');
}
// Render login page
res.render('LoginPage', {error: null});
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
      return next();
  }
  res.redirect('/login');
};

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log(username, "   ", password);
  if (username === 'admin' && password === '123aman') {
    // if valid, set the username in local storage
    req.session.user = username; 
    return res.redirect("/dashboard")

} else {
  // Authentication failed, render the login page with an error message
  res.render("LoginPage", { error: "Invalid username or password" });
}
});

//dashboard route protected
app.get("/dashboard",isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

app.get("/dashboard/employeelist",isAuthenticated, async (req, res) => {
  try {
    const username=req.session.username;
      const employees = await Employee.find(); // Fetch all employees from the database
      res.render("EmployeeList", { employees: employees, username }); // Render the EmployeeList view and pass the employee data
  } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).send("Internal Server Error");
  }
});

//logout route
app.get('/logout', (req, res) => {
  // Destroy the session or remove user data
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
          // Handle error
          return res.status(500).send('Internal Server Error');
      }
      // Redirect the user to the login page or wherever you want
      res.redirect('/login');
  });
});


app.get("/create", (req, res) => {
  res.render("NewEmployee");
});

// Route to handle employee creation
app.post("/create", upload.single('Employee[image]'), async(req, res) => {
  try {
    // Check if file is uploaded
      // Validate request body against schema
      const { error, value } = await employeeSchema.validate(req.body, { abortEarly: false });

      if (error) {
        // If validation fails, send back a 400 response with the validation error messages
        return res.status(400).json({ error: error.details.map(err => err.message) });
      }
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).send("No file uploaded");
    }

    // Extract form data from request body
    const { name, email, mobile, designation, gender, course } = req.body.Employee;

    // Check if all required fields are provided
    if (!name || !email || !mobile || !designation || !gender || !course) {
      console.error("Incomplete form data");
      return res.status(400).send("Incomplete form data");
    }

    // Create employee data object
    const employeeData = {
      f_Name: name,
      f_Email: email,
      f_Mobile: mobile,
      f_Designation: designation,
      f_gender: gender,
      f_Course: course,
      f_Image: req.file.path // Assuming this is a file path
    };
    // Save employee data to database
    const newEmployee = new employee(employeeData);
    let savedEmployee = await newEmployee.save();
    console.log(savedEmployee);

    // Redirect to dashboard
    res.redirect("/dashboard/employeelist");
  } catch (error) {
    console.error("Error saving employee:", error);
    res.status(500).send("Internal Server Error");
  }
});

//edit route
app.get("/edit/:id", async(req,res)=>{
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
        return res.status(404).send("Employee not found");
    }
    res.render("EditEmployee", { employee }); // Render edit form with employee details
} catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).send("Internal Server Error");
}
})

// Handle the PUT request to update an employee
app.put("/edit/:id",upload.single('Employee[image]'), async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, designation, gender, course } = req.body.Employee;
  const { error, value } = await employeeSchema.validate(req.body, { abortEarly: false });

      if (error) {
        // If validation fails, send back a 400 response with the validation error messages
        return res.status(400).json({ error: error.details.map(err => err.message) });
      }
  
  try {
      // Find the employee by ID
      const employee = await Employee.findById(id);

      if (!employee) {
          return res.status(404).send("Employee not found");
      }

      // Update the employee fields
      employee.f_Name = name;
      employee.f_Email = email;
      employee.f_Mobile = mobile;
      employee.f_Designation = designation;
      employee.f_gender = gender;
      employee.f_Course = course;
      if(req.file)
      {
        employee.f_Image = req.file.path;
      }

      // Save the updated employee
      await employee.save();

      res.redirect("/dashboard/employeelist"); // Redirect to the employee list or wherever you want
  } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).send("Internal Server Error");
  }
});

// DELETE route for deleting an employee
app.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
      // Find the employee by ID and delete
      await Employee.findByIdAndDelete(id);
      
      // Redirect to the employee list or wherever you want
      res.redirect('/dashboard/employeelist');
  } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
