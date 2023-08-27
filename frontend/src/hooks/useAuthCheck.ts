import {useCallback, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {Auth} from 'aws-amplify'

const useAuthCheck = () => {
  const navigate = useNavigate()

  const checkUser = useCallback(async () => {
    try {
      await Auth.currentAuthenticatedUser()
    } catch (err) {
      console.error(err)
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    checkUser()
  }, [checkUser])
}

export {useAuthCheck}
