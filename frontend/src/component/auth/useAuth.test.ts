import {act, renderHook} from '@testing-library/react'
import {useAuth} from './useAuth'

jest.mock('aws-amplify', () => ({
  Auth: {
    signIn: jest.fn(),
    signUp: jest.fn(),
  },
}))

describe('useAuth', () => {
  it('should initialize with isLoading set to false', async () => {
    const {result} = renderHook(() => useAuth())
    const {isLoading} = result.current
    expect(isLoading).toBe(false)
  })

  it('should set isLoading to false after successful signIn', async () => {
    const {result} = renderHook(() => useAuth())
    await act(async () => {
      result.current.signIn('testuser', 'password123')
    })
    const {isLoading} = result.current
    expect(isLoading).toBe(false)
  })

  it('should return a successful result on valid signIn', async () => {
    const {result} = renderHook(() => useAuth())
    const {signIn} = result.current
    let response: {success: boolean; error?: unknown}

    await act(async () => {
      response = await signIn('username', 'password')
    })

    expect(response!.success).toBe(true)
  })
})
