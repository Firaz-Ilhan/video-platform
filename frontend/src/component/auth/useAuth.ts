import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { UsernamePasswordOpts } from '@aws-amplify/auth/lib-esm/types';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (username: string | UsernamePasswordOpts, password: string | undefined) => {
    setIsLoading(true);
    try {
      await Auth.signIn(username, password);
      return { success: true };
    } catch (error) {
      console.error('authentication error', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: any, email: any, password: any) => {
    setIsLoading(true);
    try {
      const { user } = await Auth.signUp({
        username,
        password,
        attributes: { email },
      });
      return { success: true, user };
    } catch (error) {
      console.error('error signing up:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    signIn,
    signUp,
  };
};

export {useAuth}
