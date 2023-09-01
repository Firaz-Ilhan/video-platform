import {Auth as defaultAuth, Hub as defaultHub} from 'aws-amplify'
import {useState, useEffect} from 'react'

export interface User {
  attributes: {
    sub: string
    email: string
    email_verified: string
  }
}

export type AuthEvent = {
  payload: {
    event: 'signIn' | 'signOut' | string
    data?: User
  }
}

export function useAuthStatus(
  Auth = defaultAuth,
  Hub = defaultHub
): {user: User | null} {
  const [user, setUser] = useState<User | null>(null)

  const handleAuthEvents = ({payload: {event, data}}: AuthEvent) => {
    const eventHandlers: Record<string, () => void> = {
      signIn: () => setUser(data ?? null),
      signOut: () => setUser(null),
    }

    eventHandlers[event]?.()
  }

  useEffect(() => {
    const fetchAuthenticatedUser = async () => {
      try {
        const authenticatedUser: User = await Auth.currentAuthenticatedUser()
        setUser(authenticatedUser)
      } catch (error) {
        setUser(null)
      }
    }

    fetchAuthenticatedUser()

    const listener = Hub.listen('auth', handleAuthEvents)

    return () => listener()
  }, [])

  return {user}
}
