import React, { useEffect, useState } from 'react';
import ImageSlide from './ImageSlide';

const Parent = () => {
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
  console.log("slideData", slideData)
  return (
    <>
      <style jsx>
        {`
          :global(body) {
            margin: 0;
          }
          header {
            padding: 20px 48px;
            display: flex;
            justify-content: space-between;
          }
          .work-space {
            max-width: 1000px;
            margin: 0 auto;
            padding-bottom: 128px;
          }
          .album-title {
            font-size: 48px;
            padding: 64px 0;
          }
          [contenteditable]:focus {
            outline: 0 solid transparent;
          }
        `}
      </style>
      <div>
        <header>
          <div>album builder</div>
          <div>share</div>
        </header>
        <div className='work-space' >
          {/* <div className='album-title' contentEditable={true}>Sunday Mass</div> */}
          {slideData.map(el => (
            <ImageSlide
              key={el.id}
              id={el.id}
              type={el.type}
              setSlideData={setSlideData}
              veryFirst={el.id === 0}
              isSaved={Boolean(el.sid)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Parent;