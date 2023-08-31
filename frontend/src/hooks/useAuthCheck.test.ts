import {renderHook, waitFor} from '@testing-library/react'
import {Auth} from 'aws-amplify'
import {useAuthCheck} from './useAuthCheck'

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}))

jest.mock('aws-amplify')

describe('useAuthCheck', () => {
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mockUserAuthenticated(isAuthenticated: boolean) {
    const mockFunction = Auth.currentAuthenticatedUser as jest.Mock

    if (isAuthenticated) {
      mockFunction.mockResolvedValue({})
    } else {
      mockFunction.mockRejectedValue(new Error('Not authenticated'))
    }
  }

  it('navigates to /login when the user is not authenticated', async () => {
    mockUserAuthenticated(false)
    renderHook(() => useAuthCheck())
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith('/login'))
  })

  it('does not navigate when the user is authenticated', async () => {
    mockUserAuthenticated(true)
    renderHook(() => useAuthCheck())
    await waitFor(() => expect(mockedNavigate).not.toHaveBeenCalled())
  })
})
