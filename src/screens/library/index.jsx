import React, { use, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';

const Library = ({  }) => {
  const { user, isLoading } = useUser();
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    if (!isLoading) {
      getAlbumData();
    }
  }, [isLoading])

  const getAlbumData = async () => {
    let data = await fetcher(`/self/albums/${user.email}`);
    toast("Success");
    if (data?.length) {
      setAlbums(data);
    }
  };

  return (
    <>
      <style jsx>
        {`
          .work-space {
            padding: 48px 16px 128px;
            gap: 24px;
          }
          .album-cards {
            cursor: pointer;
            padding: 12px;
            width: fit-content;
            box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.15);
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          .album-cards:hover {
            box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.25);
          }
          .album-cards img {
            border-radius: 4px;
            margin-bottom: 5px;
          }
          @media (min-width: 992px) {
            .work-space {
              max-width: 1000px;
              margin: 0 auto;
              padding-bottom: 0 0 128px;
            }
          }
        `}
      </style>
      <div className="parent">
        <Navbar />
        <div className='work-space d-flex'>
          {/* <div className='album-title' contentEditable={true}>Sunday Mass</div> */}
          {albums.length ? albums.map((el, index) => (
            <Link key={el.id} href={`/album/${el.id}`}>
              <div className="album-cards">
                <img
                  src="https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/_uploads_/1670177562064.jpeg"
                  width={300}
                  height={180}
                />
                <div className='text-center'>{el.album_name}</div>
              </div>
            </Link>
          )) : (
            <div>Loading</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Library;