import {useEffect, useState} from 'react'
import {Auth} from 'aws-amplify'
import {useNavigate} from 'react-router-dom'
import './profile.css'

interface User {
  username: string
  attributes: {
    email: string
  }
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await Auth.currentAuthenticatedUser()
        const userData: User = {
          username: data.username,
          attributes: data.attributes,
        }
        setUser(userData)
      } catch (error) {
        console.log('error fetching user', error)
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await Auth.signOut()
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.log('error signing out:', error)
    }
  }

  return (
    <div className="profile-container">
      {user ? (
        <div className="profile-content">
          <h2>Profile</h2>
          <p>Username: {user.username}</p>
          <p>Email: {user.attributes.email}</p>
          <button className="signout-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )
}

export {Profile}
