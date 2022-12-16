import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ImageSlide from './ImageSlide';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { useUser } from '@auth0/nextjs-auth0';
import ElementEditor from './ElementEditor';

const Album = ({ albumId }) => {
  const [slideData, setSlideData] = useState([]);
  const { user, isLoading } = useUser();
  const isCreator = Boolean(user?.email);

  useEffect(() => {
    if (albumId && !isLoading) {
      getAlbumData();
    }
  }, [albumId, isLoading]);

  const getAlbumData = async () => {
    let data = await fetcher(`/self/photos/${albumId}`);
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
  
  const saveToStorage = async (sVal) => {
    let res = await fetcher('/self/photo/save', { method: 'POST', body: sVal });
    if (res.length) {
      toast.success("picture saved!");
    }
  }

  return (
    <>
      <style jsx>
        {`
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
        <Navbar />
        <div className='work-space'>
          {/* <div className='album-title' contentEditable={true}>Sunday Mass</div> */}
          {slideData.length ? slideData.map((el, index) => (
            <ElementEditor
              albumId={albumId}
              data={el}
              key={el.id}
              setSlideData={setSlideData}
              fetchCall={saveToStorage}
              veryFirst={index === 0}
              isPrevSaved={Boolean(slideData[index-1]?.url)}
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