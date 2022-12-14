import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ImageSlide from './ImageSlide';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';

const Album = ({ albumId }) => {
  const [slideData, setSlideData] = useState([]);

  useEffect(() => {
    if (albumId) {
      getAlbumData();
    }
  }, [albumId])

  const getAlbumData = async () => {
    let data = await fetcher(`/self/photos/${albumId}`);
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
        id: 0,
        type: null,
      }
    ]);
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
            <ImageSlide
              albumId={albumId}
              key={el.id}
              id={el.id}
              type={el.type}
              url={el.url}
              setSlideData={setSlideData}
              fetchCall={saveToStorage}
              veryFirst={index === 0}
              isSaved={Boolean(el.url)}
              slideData={slideData}
              prevIndex={index - 1}
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