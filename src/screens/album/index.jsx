import React, { useEffect, useState } from 'react';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { useUser } from '@auth0/nextjs-auth0';
import ElementEditor from './ElementEditor';
import CopyToClipboard from '../../components/CopyToClipboard';

const Album = ({ albumId }) => {
  // TODO: protect with email
  const [slideData, setSlideData] = useState([]);
  const { user, isLoading } = useUser();
  const isCreator = Boolean(user?.email);

  useEffect(() => {
    if (albumId && !isLoading) {
      getAlbumData();
    }
  }, [albumId, isLoading]);

  const getAlbumData = async () => {
    let data = await fetcher(`/self/album/${albumId}`);
    data = data.sort((a,b) => a.order - b.order);
    setSlideData(isCreator ? data.length > 0 ?
      [
        ...data,
        {
          id: 1,
          type: null,
        },
      ] : [
      {
        id: "#",
        type: null,
      },
      {
        id: 0,
        type: null,
      }
    ] : data);
  };

  return (
    <>
      <style jsx>
        {`
          .work-space {
            padding: 0px 16px 128px;
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
          .note {
            background: lightgrey;
            border: 1px solid grey;
            padding: 20px 40px;
            left: 0;
            right: 0;
            top: 32px;
            z-index: 2;
          }
          .note .close-btn {
            padding-top: 24px;
          }
          .note h1 {
            margin: 0;
          }
          @media (min-width: 992px) {
            .work-space {
              margin: 0 32px;
              padding-bottom: 0 0 128px;
            }
          }
        `}
      </style>
      <div className="parent">
        <Navbar />
        <div className='work-space relative'>
          {isCreator && (
            <div className='note absolute'>
              {/* {!shirnk && ( */}
                <>
                  <div className='d-flex space-between w-100'>
                    <h1>editor mode</h1>
                    {/* <div className='close-btn pointer text-18' onClick={() => setShrink(state => !state)}>&#x2715;</div> */}
                  </div>
                  <p>Viewers see what you see. The editor is made to resemble what the visitors see as an end result.</p>
                </>
              {/* )} */}
              <CopyToClipboard />
            </div>
          )}
          {/* <div className='album-title' contentEditable={true}>Sunday Mass</div> */}
          {slideData.length ? slideData.map((el, index) => (
            <ElementEditor
              albumId={albumId}
              data={el}
              key={el.id}
              setSlideData={setSlideData}
              order={index}
              veryFirst={index === (slideData.length - 2)}
              isPrevSaved={Boolean(slideData[index-1]?.url || slideData[index-1]?.content)}
              isCreator={isCreator}
            />
          )) : (
            <div className='loader-container'>
              <Loader />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Album;