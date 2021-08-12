const express = require("express");
const mysql = require("mysql");
const session = require("express-session");

const app = express();

const conn = mysql.createPool({
  connectionLimit: 200,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "ABCDefg",
    resave: false,
    saveUninitialized: true,
  })
);

//render home page
exports.home = (req, res) => {
  res.render("home");
};

//render login form
exports.login = (req, res) => {
  res.render("login");
};

exports.myProfile = (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  conn.getConnection((err, connect) => {
    if (err) throw err;

    connect.query(
      "SELECT * FROM admin WHERE password =?",
      [password],
      (error, results) => {
        if (err) throw err;

        if (results.length > 0) {
        } else {
          res.render("login", { message: "Invalid Password" });
        }
        connect.query(
          "SELECT * FROM admin WHERE email = ?",
          [email],
          (error, results) => {
            if (err) throw err;

            if (results.length > 0) {
              req.session.email = email;
              res.render("Dashboard", {
                adminemail: "Welcome " + req.session.email,
              });
            } else {
              res.render("login", { message: "Invalid Email Id" });
            }
          }
        );
      }
    );

    connect.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
      // When done with the connection, release it
      if (!err) {
        let removedUser = req.query.removed;
        res.render("Dashboard", { rows, removedUser });
      } else {
        console.log(err);
      }
      console.log("The data from user table: \n", rows);
    });
  });
};

//render signup form
exports.signup = (req, res) => {
  res.render("signup");
};

//add user verify if the user already exists and password checking
exports.adduser = (req, res) => {
  const { admin, email, password, confirmpassword } = req.body;

  conn.getConnection((err, connect) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connect.threadId);

    connect.query(
      "SELECT email FROM admin WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.log(error);
        }

        if (results.length > 0) {
          return res.render("signup", {
            message: "The email already exists. Please Log in to your Account!",
          });
        } else if (password != confirmpassword) {
          return res.render("signup", {
            message: "Password do not match",
          });
        }

        connect.query(
          "INSERT INTO admin SET  ?",
          {
            admin: admin,
            email: email,
            password: password,
          },
          (error, data) => {
            if (!error) {
              res.render("signup", {
                message: "Account created sucessfully, Verify Email and Login.",
              });
            } else {
              console.log(error);
            }
            console.log("The added data to user table: \n", data);
          }
        );
      }
    );
  });
};

exports.view = (req, res) => {
  conn.getConnection((err, connect) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connect.threadId);
    // User the connection
    connect.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
      // When done with the connection, release it
      if (!err) {
        let removedUser = req.query.removed;
        res.render("Dashboard", { rows, removedUser });
      } else {
        console.log(err);
      }
      console.log("The data from user table: \n", rows);
    });
  });
};

// Find User by Search
exports.find = (req, res) => {
  let searchTerm = req.body.search;
  conn.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connection.threadId);
    // User the connection
    connection.query(
      "SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ?",
      ["%" + searchTerm + "%", "%" + searchTerm + "%"],
      (err, rows) => {
        if (!err) {
          res.render("Dashboard", { rows });
        } else {
          console.log(err);
        }
        console.log("The data from user table: \n", rows);
      }
    );
  });
};

exports.form = (req, res) => {
  res.render("adduser");
};

// Add new user
exports.create = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;

  conn.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connection.threadId);

    // User the connection
    connection.query(
      "INSERT INTO user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?",
      [first_name, last_name, email, phone, comments],
      (err, rows) => {
        if (!err) {
          res.render("adduser", { alert: "User added successfully." });
        } else {
          console.log(err);
        }
        console.log("The data from user table: \n", rows);
      }
    );
  });
};

// Edit user
exports.edit = (req, res) => {
  // User the connection
  conn.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connection.threadId);
    connection.query(
      "SELECT * FROM user WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        if (!err) {
          res.render("edituser", { rows });
        } else {
          console.log(err);
        }
        console.log("The data from user table: \n", rows);
      }
    );
  });
};

// Update User
exports.update = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;
  conn.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connection.threadId);
    // User the connection
    connection.query(
      "UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?, WHERE id = ?",
      [first_name, last_name, email, phone, comments, req.params.id],
      (err, rows) => {
        if (!err) {
          // User the connection
          connection.query(
            "SELECT * FROM user WHERE id = ?",
            [req.params.id],
            (err, rows) => {
              // When done with the connection, release it

              if (!err) {
                res.render("edituser", {
                  rows,
                  alert: `${first_name} has been updated.`,
                });
              } else {
                console.log(err);
              }
              console.log("The data from user table: \n", rows);
            }
          );
        } else {
          console.log(err);
        }
        console.log("The data from user table: \n", rows);
      }
    );
  });
};

// Delete User
exports.delete = (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connection.threadId);
    // Delete a record

    // User the connection
    // connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows) => {

    //   if(!err) {
    //     res.redirect('/');
    //   } else {
    //     console.log(err);
    //   }
    //   console.log('The data from user table: \n', rows);

    // });

    // Hide a record

    connection.query(
      "UPDATE user SET status = ? WHERE id = ?",
      ["removed", req.params.id],
      (err, rows) => {
        if (!err) {
          let removedUser = encodeURIComponent("User successeflly removed.");
          res.redirect("/Dashboard/?removed=" + removedUser);
        } else {
          console.log(err);
        }
        console.log("The data from beer table are: \n", rows);
      }
    );
  });
};

// View Users
exports.viewall = (req, res) => {
  conn.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to MySQL as ID: " + connection.threadId);
    // User the connection
    connection.query(
      "SELECT * FROM user WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        if (!err) {
          res.render("viewuser", { rows });
        } else {
          console.log(err);
        }
        console.log("The data from user table: \n", rows);
      }
    );
  });
};
