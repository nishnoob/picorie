import { useUser } from '@auth0/nextjs-auth0';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ImageSlide from './ImageSlide';
import ShareWindow from './ShareWindow';
import fetcher from './utils/fetcher';

const Parent = ({ albumId }) => {
  const { user, error, isLoading } = useUser();
  const [share, setShare] = useState(false);
  const [slideData, setSlideData] = useState([]);

  useEffect(() => {
    if (albumId) {
      getAlbumData();
    }
  }, [albumId])

  // useEffect(() => saveToStorage(slideData), [slideData])

  const getAlbumData = async () => {
    
    let data = await fetcher(`/self/photo/${albumId}`);
    setSlideData(data.length > 0 ?
      [
        ...data,
        {
          id: 0,
          type: null,
        },
      ] : [
      {
        id: 0,
        type: null,
      },
      {
        id: 1,
        type: null,
      }
    ]);
  };
  
  const saveToStorage = async (val) => {
    let res = await fetcher('/self/photo/save');
    console.log("res", res)
    // localStorage.setItem('album', JSON.stringify(val));
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
          {slideData.length ? slideData.map((el, index) => (
            <ImageSlide
            albumId={albumId}
              key={el.id}
              id={el.id}
              type={el.type}
              url={el.url}
              setSlideData={setSlideData}
              fetchCall={async (sVal) => {
                let res = await fetcher('/self/photo/save', { method: 'POST', body: sVal });
                if (res.length) {
                  toast.success("picture saved!");
                }
              }}
              veryFirst={el.id === 0}
              isSaved={Boolean(el.url)}
              slideData={slideData}
              prevIndex={index - 1}
            />
          )) : (
            <div>Loading</div>
          )}
        </div>
        {share && (
          <ShareWindow slideData={slideData} onClose={() => setShare(false)} />
        )}
      </div>
    </>
  );
};

export default Parent;