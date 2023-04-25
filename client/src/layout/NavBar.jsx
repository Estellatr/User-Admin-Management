import React from 'react'
import { Link } from 'react-router-dom'
import "./NavBar.css";

const NavBar = () => {
  return (
    <nav className='nav'>
        <Link to="/" className='nav__link'>Home</Link>
        {/* <Link to="/user-profile">Your Profile</Link>
        <Link to="/all-users">Your Profile</Link> */}
        <Link to="/blogs" className='nav__link'>Blogs</Link>
        <Link to="/register" className='nav__link'>Sign Up</Link>
        <Link to="/create-new-blog" className='nav__link'>Create Blog Post</Link>
    </nav>
  )
}

export default NavBar