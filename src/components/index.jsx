import { useUser } from '@auth0/nextjs-auth0';
import React, { useEffect, useState } from 'react';
import ImageSlide from './ImageSlide';
import ShareWindow from './ShareWindow';

const Parent = ({ albumId }) => {
  const { user, error, isLoading } = useUser();
  const [share, setShare] = useState(false);
  const [slideData, setSlideData] = useState([]);

  useEffect(() => {
    if (albumId) {
      getAlbumData();
    }
  }, [albumId])

  useEffect(() => saveToStorage(slideData), [slideData])

  const getAlbumData = async () => {
    let data = await fetch(`http://localhost:3000/api/self/photo/${albumId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    data = await data.json();
    setSlideData([
      {
        id: 0,
        type: null,
      },
      {
        id: 1,
        type: null,
      }
    ]);
    console.log("albums", data);
  };
  
  const saveToStorage = (val) => {
    localStorage.setItem('album', JSON.stringify(val));
  }

  return (
    <>
      <style jsx>
        {`
          :global(body) {
            margin: 0;
            background-color: #f9f9f9;
          }
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
          .work-space {
            padding: 48px 16px 128px;
          }
          :global(body::-webkit-scrollbar) {
            display: none;
          }
          .album-title {
            font-size: 48px;
            padding: 64px 0;
          }
          [contenteditable]:focus {
            outline: 0 solid transparent;
          }
          .auth-btn {
            text-decoration: none;
            color: black;
          }
          @media (min-width: 992px) {
            .work-space {
              max-width: 1000px;
              margin: 0 auto;
              padding-bottom: 0 0 128px;
            }
          }
        `}
      </style>
      <div className="parent">
        <header className='align-center relative'>
          {user?.email ? (
            <div className='text-14'>{user?.email}</div>
          )  : (
            <a className='standard-btn hidden auth-btn ml-8' href="/api/auth/login">login</a>
          )}
          <div className='absolute title'>picorie</div>
          <div className="standard-btn" onClick={() => setShare(true)}>preview</div>
        </header>
        <div className='work-space'>
          {/* <div className='album-title' contentEditable={true}>Sunday Mass</div> */}
          {slideData.map((el, index) => (
            <ImageSlide
              key={el.id}
              id={el.id}
              type={el.type}
              setSlideData={(val) => {
                setSlideData(val);
              }}
              veryFirst={el.id === 0}
              isSaved={Boolean(el.output)}
              slideData={slideData}
              prevIndex={index - 1}
              output={el.output}
            />
          ))}
        </div>
        {share && (
          <ShareWindow slideData={slideData} onClose={() => setShare(false)} />
        )}
      </div>
    </>
  );
};

export default Parent;