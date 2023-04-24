import {faBars, faX} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useEffect, useState} from 'react'
import './header.css'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  return (
    <header className="header">
      <div className="header-container">
        <div className={`navbar-brand ${isOpen ? 'hidden' : ''}`}>
          <h1>Video Platform</h1>
        </div>

        <nav className={`navbar-menu ${isOpen ? 'active' : ''}`}>
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
        </nav>

        <button
          className="navbar-toggle"
          aria-expanded={isOpen}
          onClick={toggleMenu}>
          {isOpen ? (
            <FontAwesomeIcon icon={faX} />
          ) : (
            <FontAwesomeIcon icon={faBars} />
          )}
        </button>
      </div>
    </header>
  )
}

export {Header}
