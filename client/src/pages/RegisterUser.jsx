import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const RegisterUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const newUser = new FormData();
      newUser.append("name", name);
      newUser.append("email", email);
      newUser.append("password", password);
      newUser.append("phone", phone);
      newUser.append("image", image);

      const response = await axios.post(
        "http://127.0.0.1:8080/api/users/register",
        newUser
      );
      console.log(response);
      toast(response.data.message);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setImage('');
    } catch (error) {
      console.log(error.response.data.error.message);
    }
  };

  return (
    <div>
      <h1>Create a new Account:</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            required
            onChange={handleNameChange}
          />
        </div>
        <div className="form-control">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            name="email"
            id="email"
            value={email}
            required
            onChange={handleEmailChange}
          />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password:</label>
          <input
            type="text"
            name="password"
            id="password"
            value={password}
            required
            onChange={handlePasswordChange}
          />
        </div>
        <div className="form-control">
          <label htmlFor="phone">Phone:</label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={phone}
            required
            onChange={handlePhoneChange}
          />
        </div>
        <div className="form-control">
          <input
            type="file"
            name="image:"
            id="image"
            required
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default RegisterUser;
