import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0';
import { Toaster } from 'react-hot-toast';

import '../public/global.css';
import Airtable from 'airtable';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  // Airtable.configure({ apiKey: process.env.AUTH0_CLIENT_ID });
  Airtable.configure({ apiKey: 'keyliL9lqi7Rgn8MT' });
  //TODO: MAKE RESPONSIVE
  return (
    <>
      <Head>
        <title>picorie | albums for web </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
      <Toaster
        position='bottom-right'
        containerStyle={{
          right: 50,
          bottom: 50,
        }}
        toastOptions={{
          style: {
            background: '#FFF',
            borderStyle: 'solid',
            borderSize: 1,
            borderColor: '#CEC39B'
          },
        }}
      />
    </>
  );
}