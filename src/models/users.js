const { Schema, model } = require("mongoose");
const validator = require("validator");

// const SALT_WORK_FACTOR = 10;

const userSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    minLength: [2, "Name length must be a minimum of 2 characters"],
    maxLength: [100, "Name length cannot be longer than 100 characters"],
  },
  email: {
    type: String,
    unique: [true, "This email address already exists."],
    required: [true, "An email address is required."],
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    required: [true, "A password is required"],
    minLength: [6, "Password must be a minimum of 6 characters in length"],
    // maxLength: [18, "Password must be a maximum of 18 characters in length"],
  },
  phone: {
    type: Number,
    required: [true, "A phone number is required"],
    min: 6,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  is_verified: {
    type: Number,
    default: 0,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  // image: {
  //   data: Buffer,
  //   contentType: String,
  // },
  image: { 
    required: true, 
    type: String, 
    trim: true,
    default: '../../public/users/images/ah.png',
  },
  slug: { required: true, type: String },
});

const User = model("users", userSchema);

module.exports = User;
