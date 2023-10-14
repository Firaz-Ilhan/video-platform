import { useState } from 'react';
import { Auth } from 'aws-amplify';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (username: string, password: string | undefined) => {
    setIsLoading(true);
    try {
      await Auth.signIn(username, password);
      return { success: true };
    } catch (error: any) {
      console.error('authentication error', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
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
