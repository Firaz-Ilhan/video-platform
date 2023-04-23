import "./header.css"
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faX } from '@fortawesome/free-solid-svg-icons'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className={`navbar-brand ${isOpen ? "hidden" : ""}`}>
          <h1>Video Platform</h1>
        </div>

        <div className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <ul className="navbar-list">
            <li className="navbar-item">
              <a href="#home" className="navbar-link" onClick={toggleMenu}>
                Home
              </a>
            </li>
            <li className="navbar-item">
              <a href="#about" className="navbar-link" onClick={toggleMenu}>
                Login
              </a>
            </li>
            <li className="navbar-item">
              <a href="#about" className="navbar-link" onClick={toggleMenu}>
                About
              </a>
            </li>
          </ul>
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <FontAwesomeIcon icon={faX} /> : <FontAwesomeIcon icon={faBars} />}
        </div>
      </div>
    </nav>
  );
};

export { Header };

