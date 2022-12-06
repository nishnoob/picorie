import { useUser } from '@auth0/nextjs-auth0';
import React from 'react';

const Navbar = () => {
  const { user } = useUser();
  // const [share, setShare] = useState(false);
  // const [slideData, setSlideData] = useState([]);

  return (
    <>
      <style jsx>
        {`
          header {
            padding: 8px 48px;
            display: flex;
            justify-content: space-between;
            box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.2);
          }
          header .title {
            letter-spacing: 4px;
            font-size: 21px;
            color: var(--primary-color);
            left: 50%;
            transform: translateX(-50%);
          }
        `}
      </style>
      <>
        <header className='align-center relative'>
          <div className='text-14'>{user?.email}</div>
          <div className='absolute title'>picorie</div>
          <div className="standard-btn" onClick={() => undefined}>preview</div>
          {/* <div className="standard-btn" onClick={() => setShare(true)}>preview</div> */}
        </header>
        {/* {share && (
          <ShareWindow slideData={slideData} onClose={() => setShare(false)} />
        )} */}
      </>
    </>
  );
};

export default Navbar;