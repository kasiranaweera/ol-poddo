import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext';
import LightLogo from '../assets/Group 1.png';
import DarkLogo from '../assets/Group 2.png';

const Logo = ({ height, width}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div>
      <Link to="/" className="flex items-center gap-2 font-bold text-xl">
        <img
          src={isDark ? DarkLogo : LightLogo}
          alt="App Logo"
          style={{ height: height, width: width }}
        />
        </Link>
    </div>
  )
}

export default Logo
