import React from 'react';
import ImageSlide from './ImageSlide';

const Parent = () => (
  <>
    <style jsx>
      {`
        .content {
          width: 1200px;
          margin: 0 auto;
        }
      `}
    </style>
    <div>
      <div className='content'>
        <ImageSlide />
      </div>
    </div>
  </>
);

export default Parent;