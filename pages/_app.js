import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0';
import { Toaster } from 'react-hot-toast';

import '../public/global.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import Airtable from 'airtable';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  // Airtable.configure({ apiKey: process.env.AUTH0_CLIENT_ID });
  Airtable.configure({ apiKey: 'patKLm9Zh8kN15dRU.b803513acd7fc562130a957ea11c5b1e71ad2918a2aabca7505392256975675b' });
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