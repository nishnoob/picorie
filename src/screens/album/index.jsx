import React, { useEffect, useRef, useState } from 'react';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { useUser } from '@auth0/nextjs-auth0';
import ElementEditor from './ElementEditor';
import CopyToClipboard from '../../components/CopyToClipboard';
import { isDesktopWindow } from '../../utils';

const Album = ({ albumId }) => {
  // TODO: protect with email
  const [slideData, setSlideData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [albumData, setAlbumData] = useState({ id: albumId });
  const { user, isLoading } = useUser();
  const isCreator = useRef(isDesktopWindow() && (user?.email == albumData?.email));

  useEffect(() => {
    if (albumId && !isLoading) {
      getAlbumData();
    }
  }, [albumId, isLoading]);

  const getAlbumData = async () => {
    setIsFetching(true);
    let data = await fetcher(`/self/album/${albumId}`);
    setAlbumData({ ...data });
    const aData = data;
    var tempIsCreator = isDesktopWindow() && (user?.email == aData?.email);
    isCreator.current = tempIsCreator;
    data = data.frames.sort((a,b) => a.order - b.order);
    setSlideData(tempIsCreator ? data.length > 0 ?
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
    setIsFetching(false);
  };

  return (
    <>
      <style jsx>
        {`
          .work-space {
            padding: 0 16px 128px;
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
            padding: 0px 60px 20px 20px;
            left: 0;
            top: -16px;
            z-index: 2;
          }
          .note h3 {
            margin-bottom: 8px;
          }
          @media (min-width: 992px) {
            .work-space {
              margin: 48px 32px 0;
              padding-bottom: 0 0 128px;
            }
          }
        `}
      </style>
      <div className="parent">
        <Navbar />
        <div className='work-space relative'>
          {isCreator.current && (
            <div className='note absolute'>
              <h3>Story lives a lifetime only if you share!</h3>
              <div className='text-14 mb-16'> Use the bottom link to Get people talking about your story </div>
              <CopyToClipboard />
            </div>
          )}
          {/* <div className='album-title' contentEditable={true}>Sunday Mass</div> */}
          {slideData.length > 0 && slideData.map((el, index) => (
            <ElementEditor
              albumId={albumId}
              data={el}
              key={el.id}
              setSlideData={setSlideData}
              order={index}
              veryFirst={index === (slideData.length - 2)}
              isPrevSaved={Boolean(slideData[index-1]?.url || slideData[index-1]?.content)}
              isCreator={isCreator.current}
            />
          ))}
          {isFetching && (
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