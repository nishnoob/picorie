import React, { useEffect, useRef, useState } from 'react';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import { useUser } from '@auth0/nextjs-auth0';
import { BentoEditor } from './BentoEditor';
import { LoaderIcon } from 'react-hot-toast';

const dummyData = [
  {
    id: 1,
    x: 0,
    y: 0,
    h: 1,
    w: 1,
  },
  {
    id: 2,
    x: 1,
    y: 0,
    h: 2,
    w: 1,
  },
  {
    id: 3,
    x: 0,
    y: 2,
    w: 2,
    h: 0.5,
  }
];

export interface Block {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  p_img: string;
}

const Album = ({ albumId }: { albumId: string }) => {
  // TODO: protect with email
  const { user, isLoading } = useUser();

  const [isFetching, setIsFetching] = useState(true);
  const [albumData, setAlbumData] = useState({ id: albumId });
  const [blocks, setBlocks] = useState<Block[]>([]);
  
  const isCreator = useRef(false);

  useEffect(() => {
    if (albumId && !isLoading) {
      fetchAlbumData();
    }
  }, [albumId, isLoading]);

  const fetchAlbumData = async () => {
    setIsFetching(true);
    let data = await fetcher(`/self/album/${albumId}`);
    if (data) {
      setAlbumData({ ...data });
      isCreator.current = user?.email == data?.email;
    }
    setIsFetching(false);
  };

  const searchAndUpdateBlock = (block: Block) => {
    setBlocks((state) => {
      return state.map((b) => {
        if (b.i === block.i) {
          return {
            ...block,
            p_img: block.p_img,
          };
        }
        return b;
      });
    });
  }

  return (
    <div className="parent h-screen">
      <Navbar />
      {isFetching ? (
        <div className='loader-container flex-col'>
          <LoaderIcon className="h-18 text-[72px] w-18" />
          <div>
            Darkening the room...
          </div>
        </div>
      ) : (
        <BentoEditor
          blocks={blocks}
          setBlocks={setBlocks}
          searchAndUpdateBlock={searchAndUpdateBlock}
        />
      )}
    </div>
  );
};

export default Album;