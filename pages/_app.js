import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0';

import '../public/global.css';
import Airtable from 'airtable';

export default function App({ Component, pageProps }) {
  // Airtable.configure({ apiKey: process.env.AUTH0_CLIENT_ID });
  Airtable.configure({ apiKey: 'keyliL9lqi7Rgn8MT' });

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}