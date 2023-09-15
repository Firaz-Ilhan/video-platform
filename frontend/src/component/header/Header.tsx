import {faBars, faTimes} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Link} from 'react-router-dom'
import './header.css'
import {useAuthStatus} from './useAuthStatus'
import {useMenuToggle} from './useMenuToggle'

const Header = () => {
  const {user} = useAuthStatus()
  const {isOpen, toggleMenu} = useMenuToggle()

  const menuItems = [
    {path: '/', label: 'Home'},
    {path: user ? '/profile' : '/login', label: user ? 'Profile' : 'Login'},
    {path: '/video-upload', label: 'Submit a Video'},
  ]

  return (
    <header className="header">
      <div className="header-container">
        <div className={`navbar-brand ${isOpen ? 'hidden' : ''}`}>
          <h1>RandTube</h1>
        </div>

        <nav className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <ul className="navbar-list">
            {menuItems.map((item, index) => (
              <li className="navbar-item" key={index}>
                <Link
                  to={item.path}
                  className="navbar-link"
                  onClick={toggleMenu}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
          onClick={toggleMenu}>
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </button>
      </div>
    </header>
  )
}

export {Header}
