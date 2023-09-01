import {fireEvent, render, screen} from '@testing-library/react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Header} from './Header'
import {useAuthStatus} from './useAuthStatus'
import {useMenuToggle} from './useMenuToggle'

jest.mock('./useAuthStatus')
jest.mock('./useMenuToggle')

describe('Header', () => {
  beforeEach(() => {
    ;(useAuthStatus as jest.Mock).mockReturnValue({
      user: null,
    })
    ;(useMenuToggle as jest.Mock).mockReturnValue({
      isOpen: false,
      toggleMenu: jest.fn(),
    })
  })

  it('should toggle menu when button is clicked', () => {
    const toggleMenuMock = jest.fn()
    ;(useMenuToggle as jest.Mock).mockReturnValue({
      isOpen: false,
      toggleMenu: toggleMenuMock,
    })

    render(
      <Router>
        <Header />
      </Router>
    )

    const button = screen.getByRole('button', {name: /open menu/i})
    fireEvent.click(button)
    expect(toggleMenuMock).toHaveBeenCalled()
  })

  it('should show "Login" link when user is not authenticated', () => {
    render(
      <Router>
        <Header />
      </Router>
    )
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('should show "Profile" link when user is authenticated', () => {
    ;(useAuthStatus as jest.Mock).mockReturnValue({
      user: {attributes: {}},
    })

    render(
      <Router>
        <Header />
      </Router>
    )
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })
})
