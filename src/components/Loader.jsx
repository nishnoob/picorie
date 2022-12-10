import React from 'react';

const LOADER_WIDTH = 128;

const Loader = () => (
  <>
    <style jsx>
      {`
        .loader {
          width: ${LOADER_WIDTH}px;
          height: ${LOADER_WIDTH}px;
          position: relative;
          animation: rotate 1.5s ease-in infinite alternate;
        }
        .loader::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 10%;
          background: #b3a26577;
          width: 16px;
          height: ${LOADER_WIDTH}px;
          animation: rotate 1.2s linear infinite alternate-reverse;
        }
        .loader::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          color: #b3a26565;
          background: currentColor;
          width: ${LOADER_WIDTH}px;
          height: ${LOADER_WIDTH/2}px;
          border-radius: 0 0 64px 64px;
        }

        @keyframes rotate {
          100% { transform: rotate(360deg)}
        }
      `}
    </style>
    <div className="loader"></div>
  </>
);

export default Loader;
