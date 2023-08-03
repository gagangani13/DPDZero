const bcrypt = require("bcrypt");
const { User } = require("../model/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*^#?&])[A-Za-z\d@$!%*^#?&]{8,}$/;
  return passwordRegex.test(password);
};

const registerUser = async (req, res, next) => {
  const { username, email, password, age, gender, full_name } = req.body;
  try {
    if (!username || !email || !password || !full_name) {
      const error = new Error(
        "Invalid request. Please provide all required fields: username, email, password, full_name."
      );
      error.code = "INVALID_REQUEST";
      throw error;
    }

    if (gender !== "male" && "female" && "non-binary") {
      const error = new Error(
        "Gender field is required. Please specify the gender (e.g., male, female, non-binary)."
      );
      error.code = "GENDER_REQUIRED";
      throw error;
    }

    if (age <= 0 || typeof age !== "number") {
      const error = new Error(
        "Invalid age value. Age must be a positive integer."
      );
      error.code = "INVALID_AGE";
      throw error;
    }

    const validation = validatePassword(password);
    if (!validation) {
      const error = new Error(
        "The provided password does not meet the requirements. Password must be at least 8 characters long and contain a mix of uppercase and lowercase letters, numbers, and special characters like @,$,!,%,*,^,#,?,& only."
      );
      error.code = "INVALID_PASSWORD";
      throw error;
    }

    bcrypt.hash(password, 10, async (err, result) => {
      if (err) {
        throw new Error();
      } else {
        try {
          const user = await User.create({
            username,
            email,
            password: result,
            full_name,
            age,
            gender,
          });
          res.send({
            status: "success",
            message: "User successfully registered!",
            data: { username, email, gender, age, full_name },
          });
        } catch (error) {
          let code = "INTERNAL_SERVER_ERROR";
          let message =
            "An internal server error occurred. Please try again later.";
          if (error.errors&&error.errors[0].message === "username must be unique") {
            message =
              "The provided username is already taken. Please choose a different username.";
            code = "USERNAME_EXISTS";
          } else if (error.errors&&error.errors[0].message === "email must be unique") {
            message =
              "The provided email is already registered. Please use a different email address.";
            code = "EMAIL_EXISTS";
          }
          res.send({ status:'error', code, message });
        }
      }
    });
  } catch (error) {
    if (!error.code || !error.message) {
      error.code = "INTERNAL_SERVER_ERROR";
      error.message =
        "An internal server error occurred. Please try again later.";
    }
    res.send({
      status: "error",
      code: error.code,
      message: error.message,
    });
  }
};

const encryptJwt = (id,expiresIn) => {
  return jwt.sign({ user_id: id }, process.env.JWT_SECRET, { expiresIn });
};

const loginUser = async (req, res, next) => {
    const { username, password } = req.body;
  
    try {
      if (!username || !password) {
        const error = new Error("Missing fields. Please provide both username and password.");
        error.code = "MISSING_FIELDS";
        throw error;
      }
  
      const user = await User.findOne({ where: { username } });
  
      if (!user) {
        const error = new Error("The provided username doesn't exist.");
        error.code = "INVALID_USERNAME";
        throw error;
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        const error = new Error("Invalid credentials. The provided password is incorrect.");
        error.code = "INVALID_CREDENTIALS";
        throw error;
      }
  
      const expiresIn='1h'
      const token = encryptJwt(user.user_id,expiresIn);
  
      res.send({
        status: "success",
        message: "Access token generated successfully.",
        data: {
          access_token: token,
          expires_in: expiresIn,
        },
      });
    } catch (error) {
      if (!error.code || !error.message) {
        error.code = "INTERNAL_SERVER_ERROR";
        error.message = "An internal server error occurred. Please try again later.";
      }
      res.send({
        status: "error",
        code: error.code,
        message: error.message,
      });
    }
  };

module.exports = { registerUser, loginUser };
