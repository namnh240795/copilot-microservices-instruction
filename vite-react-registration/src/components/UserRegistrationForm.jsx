import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const UserRegistrationForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      console.log('User data submitted:', data);
      setServerError('');
    } catch (error) {
      setServerError('Failed to register user. Please try again.');
    }
  };

  return (
    <div className="registration-form">
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            {...register('username', { required: 'Username is required' })}
          />
          {errors.username && <p className="error">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long',
              },
            })}
          />
          {errors.password && <p className="error">{errors.password.message}</p>}
        </div>

        {serverError && <p className="error server-error">{serverError}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default UserRegistrationForm;