import React, { useEffect, useRef, useState } from 'react';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { useUser } from '@auth0/nextjs-auth0';
import ElementEditor from './ElementEditor';
import CopyToClipboard from '../../components/CopyToClipboard';
import { isDesktopWindow } from '../../utils';
import { BlocksEditor } from './NewEditor/BlocksEditor';

const Album = ({ albumId }) => {
  // TODO: protect with email
  const [slideData, setSlideData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [albumData, setAlbumData] = useState({ id: albumId });
  const [blocks, setBlocks] = useState([]);
  

  const { user, isLoading } = useUser();
  const isCreator = useRef(user?.email == albumData?.email);

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
    var tempIsCreator = (user?.email == aData?.email);
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

  const inputRef = useRef(null);

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        // this.setState({ src: reader.result })
        createNewBlock(reader.result)
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }


  function handleButtonClick(e) {
    e.preventDefault();
    if (!inputRef || !inputRef.current) return;

    inputRef.current.click();
  }

  const createNewBlock = (img_src) => {
    // console.log('createNewBlock', img_src);
    setBlocks((prev) => [
      ...prev,
      { id: Date.now(), x: 0, y: 0, w: 1, h: 1, p_img: img_src },
    ]);
  }

  const searchAndUpdateBlock = (block) => {
    setBlocks((state) => {
      return state.map((b) => {
        if (b.id === block.id) {
          return {
            ...block,
            p_img: block.p_img,
          };
        }
        return b;
      });
    });
    // const newBlocks = state.blocks.map(block => {
    //   if (block.id === state.cropBlock.id) {
    //     return {
    //       ...block,
    //       p_img: croppedImageUrl
    //     }
    //   }
    //   return block;
    // })
  }

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
      <div className="parent h-screen">
        <Navbar />
        <div className='h-screen overflow-scroll relative'>
          <BlocksEditor blocks={blocks} searchAndUpdateBlock={searchAndUpdateBlock} />
          {/* {isFetching && (
            <div className='loader-container'>
              <Loader />
            </div>
          )} */}
          <div className="fixed bottom-0 left-0 w-full p-2">
            <button onClick={handleButtonClick} className='w-full bg-gray-300 shadow py-2'>Upload File</button>
            <input ref={inputRef} type='file' hidden onChange={onSelectFile} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Album;