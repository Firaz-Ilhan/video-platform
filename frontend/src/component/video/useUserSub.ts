import {useState, useEffect} from 'react'
import {Auth} from 'aws-amplify'

function useUserSub() {
  const [userSub, setUserSub] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchUserSub() {
      try {
        const userInfo = await Auth.currentAuthenticatedUser()
        setUserSub(userInfo.attributes.sub)
      } catch (err) {
        console.error('Error fetching user information:', err)
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
