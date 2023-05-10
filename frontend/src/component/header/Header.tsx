import {faBars, faX} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {useEffect, useState} from 'react'
import './header.css'
import {Link} from 'react-router-dom'

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
              <Link to="/" className="navbar-link" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/login" className="navbar-link" onClick={toggleMenu}>
                Login
              </Link>
            </li>
          </ul>
        </nav>

        <button
          className="navbar-toggle"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
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
