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
            padding: 20px 48px;
            display: flex;
            justify-content: space-between;
            background: black;
          }
          header .title {
            letter-spacing: 8px;
            font-size: 28px;
            color: var(--primary-color);
            padding: 2px 0px 6px 6px;
          }
          header button {
            border-color: white;
            background: transparent;
            color: white;
          }
        `}
      </style>
      <>
        <header className='align-center relative'>
          {/* <div className='text-14 text-white'>{user?.email}</div> */}
          <div className='title'>picorie</div>
          <button className="minimal-btn" onClick={() => undefined}>preview</button>
          {/* <div className="minimal-btn" onClick={() => setShare(true)}>preview</div> */}
        </header>
        {/* {share && (
          <ShareWindow slideData={slideData} onClose={() => setShare(false)} />
        )} */}
      </>
    </>
  );
};

export default Navbar;