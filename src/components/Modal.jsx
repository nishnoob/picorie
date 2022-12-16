import React from 'react';

const Modal = ({ children, title, onClose = () => undefined }) => (
  <>
    <style jsx>
      {`
        .backdrop {
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: #00000088;
          z-index: 3;
        }
        .modal {
          min-width: 500px;
          background: white;
          width: fit-content;
          margin: 23vh auto 0;
          padding: 56px 24px 24px;
        }
        .close-btn {
          right: 18px;
          top: 12px;
          cursor: pointer;
        }
        .title-text {
          top: 12px;
        }
      `}
    </style>
    <div className='backdrop absolute' onClick={onClose}>
      <div className='modal relative' onClick={e => e.stopPropagation()}>
        {title && <div className='title-text text-24 absolute'>{title}</div>}
        <div className='close-btn absolute text-18' onClick={onClose}>&#x2715;</div>
        {children}
      </div>
    </div>
  </>
);

export default Modal;
