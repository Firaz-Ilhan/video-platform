import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import './auth.css';

type FormValues = {
  username: string;
  confirmationCode: string;
};

const Confirmation = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormValues> = async ({ username, confirmationCode }) => {
    try {
      await Auth.confirmSignUp(username, confirmationCode);
      navigate('/');
    } catch (error) {
      console.error('error confirming sign up:', error);
    }
  };

  return (
    <div className="authForm">
      <h2 id="authHeader">Confirm Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="form">
        <div className="formControl">
          <label htmlFor="username">Username:</label>
          <input 
            type="text" 
            id="username" 
            {...register('username', { required: true })} 
          />
          {errors.username && <div className="error" role="alert">Username is required.</div>}
        </div>
        <div className="formControl">
          <label htmlFor="confirmationCode">Confirmation Code:</label>
          <input 
            type="text" 
            id="confirmationCode" 
            {...register('confirmationCode', { required: true })} 
          />
          {errors.confirmationCode && <div className="error" role="alert">Confirmation code is required.</div>}
        </div>
        <input type="submit" value="Confirm Registration" />
      </form>
    </div>
  );
};

export { Confirmation };
