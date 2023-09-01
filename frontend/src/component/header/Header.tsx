import {faBars, faX} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Link} from 'react-router-dom'
import './header.css'
import {useAuthStatus} from './useAuthStatus'
import {useMenuToggle} from './useMenuToggle'

const Header = () => {
  const {user} = useAuthStatus()
  const {isOpen, toggleMenu} = useMenuToggle()

  return (
    <header className="header">
      <div className="header-container">
        <div className={`navbar-brand ${isOpen ? 'hidden' : ''}`}>
          <h1>RandTube</h1>
        </div>

        <nav className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <ul className="navbar-list">
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            <li className="navbar-item">
              <Link
                to={user ? '/profile' : '/login'}
                className="navbar-link"
                onClick={toggleMenu}>
                {user ? 'Profile' : 'Login'}
              </Link>
            </li>
            <li className="navbar-item">
              <Link
                to="/video-upload"
                className="navbar-link"
                onClick={toggleMenu}>
                Submit a Video
              </Link>
            </li>
          </ul>
        </nav>

        <button
          type="button"
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
