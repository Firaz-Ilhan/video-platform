import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import './auth.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({username: '', password: ''})

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

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault()

    if (validateForm()) {
      console.log({username, password})
    }
  }

  return (
    <div className="authForm">
      <h2 id="loginHeader">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="formControl">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <div className="error" role="alert">
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
          />
          <div className="error" role="alert">
            {errors.password}
          </div>
        </div>
        <input type="submit" value="Submit" />
      </form>

      <div className="loginRegisterLink">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  )
}

export {Login}
