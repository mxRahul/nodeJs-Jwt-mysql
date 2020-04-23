const User = require("../models/user.model.js");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const config = require("../auth.config");
// Create and Save a new user
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a user
  const user = new User({
    email: req.body.user.email,
    firstName: req.body.user.firstName,
    lastName: req.body.user.lastName,
    userName: req.body.user.userName,
    password:  bcrypt.hashSync(req.body.user.password, 8),
    mobile: req.body.user.mobile,
    city: req.body.user.city,
    age: req.body.user.age
  });

  // Save user in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while creating the user."
      });
    else res.send(data);
  });
};

// Retrieve all users from the database.
exports.findAll = (req, res) => {
  User.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    else res.send(data);
  });
};

// Find a single user with a userId
exports.findOne = (req, res) => {
  User.findById(req.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found user with id ${req.params.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Update a user identified by the userId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updateById(
    req.userId,
    new User(req.body.user),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.userId
          });
        }
      } else res.send(data);
    }
  );
};

// Delete a user with the specified userId in the request
exports.delete = (req, res) => {
  User.remove(req.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found user with id ${req.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete user with id " + req.userId
        });
      }
    } else res.send({
      message: `user was deleted successfully!`
    });
  });
};


exports.login = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }
  User.findByEmail(req.body.user.email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found user with id ${req.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with id " + req.userId
        });
      }
    } else {
      var passwordIsValid = bcrypt.compareSync(
        req.body.user.password,
        data[0].password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          token: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({
        id: data[0].id
      }, config.secret, {
        expiresIn: 1800 // 24 hours
      });
      res.status(200).send({
        user: {
          id: data[0].id,
          userName: data[0].userName,
          email: data[0].email,
          token: token
        }
      });
    }
  });
}


exports.updatePassword = (req, res) =>{
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a user
  const user = {
    id: req.userId,
    oldPassword: req.body.user.oldPassword,
    password:  bcrypt.hashSync(req.body.user.newPassword, 8)
  }
  
    // Update password
    User.updatePassword(user, (err, data) => {
      if (err)
        res.status(500).send({
          message: err.message || "Some error occurred while creating the user."
        });
      else res.send(data);
    });
}

exports.uploadImage = (req, res)=>{
console.log('req', req);
  User.updateImagePath(
    req.userId,
    req.file.filename,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.userId
          });
        }
      } else res.send(data);
    }
  );
};