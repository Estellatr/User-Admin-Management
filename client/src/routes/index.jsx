import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AllUsers from "../pages/AllUsers";
import UserProfile from "../pages/UserProfile";
import Blogs from "../pages/Blogs";
import NavBar from "../layout/NavBar";
import RegisterUser from "../pages/RegisterUser";
// import CreateBlog from "../pages/CreatePost";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Index = () => {
  return (
    <BrowserRouter>
    <ToastContainer />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/all-users" element={<AllUsers />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/register" element={<RegisterUser />} />
        {/* <Route path="/create-new-blog" element={<CreateBlog />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default Index;
