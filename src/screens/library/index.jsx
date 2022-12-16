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
  const alb1 = albums?.slice(0, 3) || [];
  const alb2 = albums?.slice(3) || [];
  console.log("first", alb1, alb2)

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
            padding-top: 48px;
          }
          .work-space h1 {
            margin-bottom: 48px;
          }
          .card-row {
            justify-content: space-between;
            flex-wrap: wrap;
            position: relative;
            z-index: 1;
          }
          .card-row :global(a) {
            width: 32%;
          }
          .album-card, .add-album-card {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .album-card:hover {
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
          .album-title-col {
            margin-top: 64px;
          }
          .album-title-col :global(a) {
            text-decoration: none;
          }
          .album-title-col .album-title-text {
            font-size: 48px;
            color: black;
            transition: all 0.2s ease;
          }
          .album-title-col .album-title-text:hover {
            opacity: 0.5;
            cursor: pointer;
          }
          .album-title-col img {
            z-index: 0;
            position: absolute;
            right: 0;
            opacity: 0;
            transform: translateY(-30%);
          }
          .album-title-col .album-title-text:hover +  img {
            opacity: 1;
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
        <div className='work-space'>
          <h1>Library</h1>
          {/* <div className='album-title' contentEditable={true}>Sunday Mass</div> */}
          {albums ? (
            <>
              <div className='card-row d-flex'>
                {alb1.length > 0 && alb1.map((el, index) => (
                  <Link key={el.id} href={`/album/${el.id}`}>
                    <div className="album-card relative">
                      <img
                        src={el.cover?.[0] || `https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/_uploads_/1670177562064.jpeg`}
                        width="100%"
                        height="auto"
                      />
                      <div className='text-center absolute text-24'>{el.album_name}</div>
                    </div>
                  </Link>
                ))}
                {alb1.length < 3 && (
                  <div className="add-album-card d-flex-col justify-center" onClick={() => setCreate(true)}>
                    <div>
                      <div className='text-center text-24'>+</div>
                      <div className='text-center text-14'>new album</div>
                    </div>
                  </div>
                )}
              </div>
              {alb1.length >= 3 && (
                <div className='album-title-col'>
                  <div className='album-title-text' onClick={() => setCreate(true)}>+ new album</div>
                  {alb2.map(el => (
                    <Link key={el.id} href={`/album/${el.id}`}>
                      <div className='album-title-text'>{el.album_name}</div>
                      {el.cover?.[0] && (
                        <img
                          src={el.cover?.[0] || `https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/_uploads_/1670177562064.jpeg`}
                          width={"50%"}
                          height={"auto"}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              )}
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