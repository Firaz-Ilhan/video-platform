import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import './auth.css';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data: any) => console.log(data);

  return (
    <div className="authForm">
      <h2 id="authHeader">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="formControl">
          <label htmlFor="username">Username:</label>
          <input 
            type="text" 
            id="username" 
            {...register('username', { required: true, minLength: 3, maxLength: 20 })} 
            autoFocus 
          />
          {errors.username && <div className="error" role="alert">Username must be between 3 and 20 characters.</div>}
        </div>
        <div className="formControl">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            {...register('email', { required: true, pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i })} 
          />
          {errors.email && <div className="error" role="alert">Please enter a valid email address.</div>}
        </div>
        <div className="formControl">
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            {...register('password', { required: true, minLength: 8 })} 
          />
          {errors.password && <div className="error" role="alert">Password must be at least 8 characters long.</div>}
        </div>
        <input type="submit" value="Register" />
      </form>

      <div className="loginRegisterLink">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export {Register};
