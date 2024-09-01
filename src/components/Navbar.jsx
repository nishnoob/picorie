import { useUser } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import React from 'react';

const Navbar = () => {
  const { user } = useUser();
  const router = useRouter();

  return (
    <>
      <style jsx>
        {`
          header {
            display: flex;
            justify-content: space-between;
            background: black;
          }
          header .title {
            font-size: 18px;
            color: var(--primary-color);
            padding: 2px 0px 6px 6px;
          }
          header button {
            border-color: white;
            background: transparent;
            color: white;
            font-size: 10px;
            border-style: dashed;
          }
        `}
      </style>
      <>
        <header className='px-4 py-3 align-center relative drop-shadow-md'>
          <div className='title'>picorie</div>
          <div className='text-[10px] text-slate-400'>{
            user?.email || (
            <button className='minimal-btn text-[10px]' onClick={() => router.push('/')}>Login</button>
          )}</div>
        </header>
        {/* {share && (
          <ShareWindow slideData={slideData} onClose={() => setShare(false)} />
        )} */}
      </>
    </>
  );
};

export default Navbar;