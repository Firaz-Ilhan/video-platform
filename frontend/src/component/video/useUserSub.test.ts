import {renderHook, waitFor} from '@testing-library/react'
import {Auth} from 'aws-amplify'
import {useUserSub} from './useUserSub'

jest.mock('aws-amplify', () => ({
  Auth: {
    currentAuthenticatedUser: jest.fn(),
  },
}))

const mockedCurrentAuthenticatedUser =
  Auth.currentAuthenticatedUser as jest.MockedFunction<
    typeof Auth.currentAuthenticatedUser
  >

describe('useUserSub', () => {
  afterEach(() => {
    mockedCurrentAuthenticatedUser.mockReset()
  })

  it('fetches user sub correctly', async () => {
    const mockUserAttributes = {
      sub: 'mock-sub',
      email: 'test@mail.de',
      email_verified: 'true',
    }

    mockedCurrentAuthenticatedUser.mockResolvedValue({
      attributes: mockUserAttributes,
    })

    const {result} = renderHook(() => useUserSub())

    await waitFor(() => {
      expect(result.current.userSub).toBe(null)
    })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    await waitFor(() => {
      expect(result.current.userSub).toBe(mockUserAttributes.sub)
    })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    await waitFor(() => {
      expect(result.current.error).toBe(null)
    })
  })

  it('handles error correctly', async () => {
    mockedCurrentAuthenticatedUser.mockRejectedValue(new Error('Mock error'))

    const {result} = renderHook(() => useUserSub())

    expect(result.current.userSub).toBe(null)
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.userSub).toBe(null)
    })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch user info.')
    })
  })
})
