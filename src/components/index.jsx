import React, { useEffect, useState } from 'react';
import ImageSlide from './ImageSlide';
import ShareWindow from './ShareWindow';

const Parent = () => {
  const [share, setShare] = useState(false);
  const [slideData, setSlideData] = useState([
    {
      id: 0,
      type: null,
    },
    {
      id: 1,
      type: null,
    }
  ]);

  useEffect(() => {
    const albumData = localStorage.getItem('album');
    if (albumData) {
      setSlideData(JSON.parse(albumData));
    }
  }, [])

  useEffect(() => saveToStorage(slideData), [slideData])
  
  const saveToStorage = (val) => {
    localStorage.setItem('album', JSON.stringify(val));
  }

  return (
    <>
      <style jsx>
        {`
          :global(body) {
            margin: 0;
          }
          header {
            padding: 8px 48px;
            display: flex;
            justify-content: space-between;
            box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.2);
          }
          header div {
            padding: 6px 9px;
          }
          .work-space {
            max-width: 1000px;
            margin: 0 auto;
            padding-bottom: 128px;
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
          .share-btn {
            border: 1px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            transition: border 0.1s ease;
          }
          .share-btn:hover {
            border-color: grey
          }
        `}
      </style>
      <div className="parent">
        <header>
          <div>album builder</div>
          <div className="share-btn" onClick={() => setShare(true)}>preview</div>
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