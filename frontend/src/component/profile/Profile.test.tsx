import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Auth} from 'aws-amplify'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {Profile} from './Profile'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('aws-amplify', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
    signOut: jest.fn(),
  },
}))

describe('<Profile />', () => {
  const mockUserData = {
    username: 'testUser',
    attributes: {
      email: 'test@example.com',
    },
  }

  const renderProfile = () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login">Login Page</Route>
        </Routes>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders and fetches user data', async () => {
    ;(Auth.currentAuthenticatedUser as jest.Mock).mockResolvedValueOnce(
      mockUserData
    )

    renderProfile()

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Email: test@example.com')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Username: testUser')).toBeInTheDocument()
    })
  })

  it('signs out user and redirects to login', async () => {
    ;(Auth.currentAuthenticatedUser as jest.Mock).mockResolvedValueOnce(
      mockUserData
    )

    renderProfile()

    await waitFor(() => {
      expect(screen.getByText('Username: testUser')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Sign Out'))

    await waitFor(() => {
      expect(Auth.signOut).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('logs an error when fetching the user fails', async () => {
    ;(Auth.currentAuthenticatedUser as jest.Mock).mockRejectedValueOnce(
      new Error('Fetching user failed')
    )

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    renderProfile()

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        'error fetching user',
        expect.any(Error)
      )
    })

    logSpy.mockRestore()
  })
})
