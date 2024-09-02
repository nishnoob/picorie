import React, { use, useEffect, useRef, useState } from 'react';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import { useUser } from '@auth0/nextjs-auth0';
import { BentoEditor } from './BentoEditor';
import { LoaderIcon } from 'react-hot-toast';

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
      const blocksArray = data?.frames.map(frame => ({
        i: frame.id,
        x: frame.x,
        y: frame.y,
        w: frame.w,
        h: frame.h,
        p_img: frame.url,
        maxW: 2,
        maxH: 2,
      }));
      setBlocks(blocksArray);
      isCreator.current = user?.email == data?.email;
    }
    setIsFetching(false);
  };

  return (
    <div className="flex flex-col">
      {/* <Navbar /> */}
      {isFetching ? (
        <div className='loader-container flex-col'>
          <LoaderIcon className="h-18 text-[72px] w-18" />
          <div>
            Darkening the room...
          </div>
        </div>
      ) : (
        <BentoEditor
          albumId={albumId}
          blocks={blocks}
          setBlocks={setBlocks}
          isCreator={isCreator.current}
        />
      )}
    </div>
  );
};

export default Album;