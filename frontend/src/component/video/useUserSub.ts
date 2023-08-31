import {useState, useEffect} from 'react'
import {Auth} from 'aws-amplify'

export interface User {
  attributes: {
    sub: string
    email: string
    email_verified: string
  }
}

type AuthInterface = {
  currentAuthenticatedUser: () => Promise<User>
}

const defaultAuth: AuthInterface = {
  currentAuthenticatedUser: () => Auth.currentAuthenticatedUser(),
}

function useUserSub(auth: AuthInterface = defaultAuth) {
  const [userSub, setUserSub] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchUserSub() {
      try {
        const userInfo = await auth.currentAuthenticatedUser()
        setUserSub(userInfo.attributes.sub)
      } catch (err) {
        setError('Failed to fetch user info.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserSub()
  }, [])

  return {userSub, error, isLoading}
}

export {useUserSub}
