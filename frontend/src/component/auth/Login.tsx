import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {LoadingButton} from './LoadingButton'
import './auth.css'
import {useAuth} from './useAuth'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({username: '', password: ''})
  const {isLoading, signIn} = useAuth()
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()

  const validateForm = () => {
    let formIsValid = true
    let errors = {username: '', password: ''}

    if (!username) {
      formIsValid = false
      errors.username = 'Please enter your username.'
    }

    if (!password) {
      formIsValid = false
      errors.password = 'Please enter your password.'
    }

    setErrors(errors)
    return formIsValid
  }

  const handleSubmit = async (event: {preventDefault: () => void}) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const {success, error} = await signIn(username, password)
    if (success) {
      navigate('/')
    } else {
      setLoginError(error.message || 'An error occurred during login.')
    }
  }

  return (
    <div className="authForm dashed">
      <h2 id="loginHeader">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-describedby="usernameError"
            autoFocus
          />
          <div className="error" role="alert" id="usernameError">
            {errors.username}
          </div>
        </div>
        <div className="formControl">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="passwordError"
          />
          <div className="error" role="alert" id="passwordError">
            {errors.password}
          </div>
        </div>
        {loginError && (
          <div className="error" role="alert">
            {loginError}
          </div>
        )}
        <LoadingButton type="submit" isLoading={isLoading}>
          Login
        </LoadingButton>
      </form>

      <div className="loginRegisterLink">
        Need an account? <Link to="/register">Sign up now</Link>
      </div>
    </div>
  )
}

export {Login}
