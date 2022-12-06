import React, { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import Component from '../src/screens';
import { isServer } from '../src/utils';

const HomePage = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if ( !isLoading && user?.email ) {
      router?.push('/library')
    }
  }, [isLoading]);

  return <Component />;
};

export default HomePage;
