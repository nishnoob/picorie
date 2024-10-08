import React, { useEffect, useRef, useState } from 'react';
import fetcher from '../../utils/fetcher';
import { useUser } from '@auth0/nextjs-auth0';
import { BentoEditor } from './BentoEditor';
import { LoaderIcon } from 'react-hot-toast';

// TODO: Match it with BE table structure
export interface Block {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  p_img?: string;
  cropped_img?: string;
  crop_x?: number;
  crop_y?: number;
  crop_w?: number;
  crop_h?: number;
}

const Album = ({ albumId }: { albumId: string }) => {
  const { user, isLoading } = useUser();
  const [isFetching, setIsFetching] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const isCreator = useRef(false);

  useEffect(() => {
    if (albumId && !isLoading) {
      fetchAlbumData();
    }
  }, [isLoading]);

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
        text: frame.text || undefined,
        p_img: frame.url || undefined,
        cropped_img: frame.cropped_url || undefined,
        crop_x: frame.crop_x,
        crop_y: frame.crop_y,
        crop_w: frame.crop_w,
        crop_h: frame.crop_h,
        // TODO: Set maxW, maxH in parent component as default
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
      <div className='h-96'>
        {/* Footer */}
      </div>
    </div>
  );
};

export default Album;