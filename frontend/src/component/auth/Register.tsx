import {Auth} from 'aws-amplify'
import {useState} from 'react'
import {SubmitHandler, useForm} from 'react-hook-form'
import {Link, useNavigate} from 'react-router-dom'
import {LoadingButton} from './LoadingButton'
import './auth.css'

type FormValues = {
  username: string
  email: string
  password: string
}

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true)
    const {username, email, password} = data

    try {
      await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
      })
      navigate('/confirmation')
    } catch (error: any) {
      console.error('error signing up:', error)
      setRegisterError(error.message || 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="authForm dashed">
      <h2 id="authHeader">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="formControl">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            {...register('username', {
              required: true,
              minLength: 3,
              maxLength: 20,
            })}
            aria-describedby="usernameError"
            autoFocus
          />
          {errors.username && (
            <div className="error" role="alert" id="usernameError">
              Username must be between 3 and 20 characters.
            </div>
          )}
        </div>
        <div className="formControl">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            {...register('email', {
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
            })}
            aria-describedby="emailError"
          />
          {errors.email && (
            <div className="error" role="alert" id="emailError">
              Please enter a valid email address.
            </div>
          )}
        </div>
        <div className="formControl">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            {...register('password', {required: true, minLength: 8})}
            aria-describedby="passwordError"
          />
          {errors.password && (
            <div className="error" role="alert" id="passwordError">
              Password must be at least 8 characters long.
            </div>
          )}
        </div>
        {registerError && (
          <div className="error" role="alert">
            {registerError}
          </div>
        )}
        <LoadingButton type="submit" isLoading={isLoading}>
          Register
        </LoadingButton>
      </form>

      <div className="loginRegisterLink">
        Already have an account? <Link to="/login">Log in here</Link>
      </div>
    </div>
  )
}

export {Register}
