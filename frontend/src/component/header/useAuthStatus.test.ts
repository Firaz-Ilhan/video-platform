import {renderHook, act, waitFor} from '@testing-library/react'
import {User, useAuthStatus} from './useAuthStatus'
import {Auth, Hub} from 'aws-amplify'

jest.mock('aws-amplify')

const mockUser: User = {
  attributes: {
    sub: '12345',
    email: 'test@example.com',
    email_verified: 'true',
  },
}

describe('useAuthStatus', () => {
  beforeEach(() => {
    ;(Auth.currentAuthenticatedUser as jest.Mock).mockReset()
    ;(Hub.listen as jest.Mock).mockReset().mockReturnValue(() => {})
  })

  it('sets user if authenticated', async () => {
    ;(Auth.currentAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser)

    const {result} = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('sets user to null if not authenticated', async () => {
    ;(Auth.currentAuthenticatedUser as jest.Mock).mockRejectedValue(
      new Error('Not authenticated')
    )

    const {result} = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.user).toBeNull()
    })
  })
})
