import {useState, useEffect} from 'react'
import {Auth} from 'aws-amplify'

function useUserSub() {
  const [userSub, setUserSub] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserSub() {
      try {
        const userInfo = await Auth.currentAuthenticatedUser()
        setUserSub(userInfo.attributes.sub)
      } catch (err) {
        console.log('Error fetching user information:', err)
        setError('Failed to fetch user info.')
      }
    }

    fetchUserSub()
  }, [])

  return {userSub, error}
}

export {useUserSub}