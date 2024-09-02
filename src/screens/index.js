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
          .title {
            font-size: 48px;
            color: var(--primary-color);
            margin-bottom: 24px;
          }
        `}
      </style>
      <div className='h-screen w-screen flex flex-col justify-center items-center bg-black fixed'>
        <div className='title'>picorie</div>
        <button
          className='border px-4 border-white text-white'
          onClick={() => router.push('/api/auth/login')}
          // href="/api/auth/login"
        >
          login
        </button>
      </div>
    </>
  );
};

export default HomeScreen;
