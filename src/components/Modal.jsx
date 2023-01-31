import React, { useEffect, useState } from 'react';

const Modal = ({ children, title, onClose = () => undefined }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    () => {setVisible(false)};
  }, []);

  return (
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
            height: fit-content;
            margin: 23vh auto 0;
            padding: 56px 24px 24px;
            transition: 0.2s ease-in-out;
          }
          .close-btn {
            right: 18px;
            top: 12px;
            cursor: pointer;
          }
          .title-text {
            top: 12px;
          }
          @media (max-width: 992px) {
            .backdrop {
              padding: 20px;
              align-items: flex-end;
            }
            .modal {
              flex: 1;
              width: auto;
              min-width: 0;
              padding: 68px 24px 24px;
              transform: translateY(50%);
              opacity: 0;
            }
            .close-btn {
              top: 16px;
            }
            .vi {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div className='backdrop absolute d-flex' onClick={onClose}>
        <div className={`modal relative ${visible && 'vi'}`} onClick={e => e.stopPropagation()}>
          {title && <div className='title-text text-24 absolute'>{title}</div>}
          <div className='close-btn absolute text-18' onClick={onClose}>&#x2715;</div>
          {children}
        </div>
      </div>
    </>
  );
}

export default Modal;
