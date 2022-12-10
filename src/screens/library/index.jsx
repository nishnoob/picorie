import React, { use, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import fetcher from '../../utils/fetcher';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

const Library = ({  }) => {
  const { user, isLoading } = useUser();
  const [albums, setAlbums] = useState(null);
  const [create, setCreate] = useState(false);
  const [createName, setCreateName] = useState('');

  useEffect(() => {
    if (!isLoading) {
      getAlbumData();
    }
  }, [isLoading])

  useEffect(() => {
    if (!create) {
      setCreateName('');
    }
  }, [create]);

  const getAlbumData = async () => {
    let data = await fetcher(`/self/albums/${user?.email}`);
    if (data?.length) {
      setAlbums(data);
    }
  };

  const createAlbum = async () => {
    let data = await fetcher('/self/album/create',
      {
        method: 'POST',
        body: {
          album_name: createName.trim(),
          email: user?.email,
        },
      },
    );
    if (data?.length) {
      toast.success("Album succesfully created!");
      setAlbums(state => [...state, { album_name: createName, email: user.email, id: data[0] }]);
      setCreate(false);
    }
  };

  return (
    <>
      <style jsx>
        {`
          .work-space {
            padding: 48px 16px 128px;
            gap: 28px;
            flex-wrap: wrap;
          }
          .album-card, .add-album-card {
            cursor: pointer;
            width: fit-content;
            transition: all 0.2s ease;
          }
          .album-card:hover {
            box-shadow: 0px 0px 5px 0px rgba(0,0,0,0.25);
            transform: scale(1.01);
          }
          .album-card :global(.absolute) {
            bottom: -8px;
            right: -8px;
            text-decoration: none;
            color: black;
            background: white;
          }
          .add-album-card {
            width: 300px;
            height: 180px;
            border: 1px solid grey;
          }
          .add-album-card:hover {
            border: 1px solid black;
            transform: scale(1.01);

          }
          .add-album-card :global(.text-14),
          .add-album-card :global(.text-24) {
            color: grey;
          }
          .add-album-card:hover :global(.text-14),
          .add-album-card:hover :global(.text-24) {
            color: black;
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
          {albums ? (
            <>
              {
                albums.map((el, index) => (
                  <Link key={el.id} href={`/album/${el.id}`}>
                    <div className="album-card relative">
                      <img
                        src="https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/_uploads_/1670177562064.jpeg"
                        width={300}
                        height={180}
                      />
                      <div className='text-center absolute text-24'>{el.album_name}</div>
                    </div>
                  </Link>
                ))
              }
              <div className="add-album-card d-flex-col justify-center" onClick={() => setCreate(true)}>
                <div>
                  <div className='text-center text-24'>+</div>
                  <div className='text-center text-14'>new album</div>
                </div>
              </div>
              {create && (
                <Modal title='Name your new album!' onClose={() => setCreate(false)}>
                  <div className='d-flex-col'>
                    <input className='standard-input' placeholder='album name' value={createName} onChange={e => setCreateName(e.target.value)} />
                    <button className='standard-btn mt-36' onClick={createAlbum} disabled={createName.length < 3}>save</button>
                  </div>
                </Modal>
              )}
            </>
          ) : (
            <div className='loader-container'>
              <Loader />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Library;