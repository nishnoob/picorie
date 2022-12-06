import { useRouter } from 'next/router';
import React from 'react';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <>
      <style jsx>
        {`
          .wrapper {
            width: 100vw;
            height: 100vh;
          }
          .auth-btn {
            text-decoration: none;
            color: black;
            width: fit-content;
          }
          .title {
            letter-spacing: 8px;
            font-size: 48px;
            color: var(--primary-color);
            margin-bottom: 24px;
          }
        `}
      </style>
      <div className='wrapper d-flex-col align-center justify-center'>
        <div className='title'>picorie</div>
        <div
          className='standard-btn auth-btn'
          onClick={() => router.push('/api/auth/login')}
          // href="/api/auth/login"
        >
          login
        </div>
      </div>
    </>
  );
};

export default HomeScreen;
