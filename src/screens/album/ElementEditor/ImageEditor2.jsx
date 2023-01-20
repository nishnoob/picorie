import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast';
import { epochToS3URL } from '../../../utils';
import fetcher from '../../../utils/fetcher';
import ImageEditor from './ImageEditor';
import { DeleteImageFromS3, UploadImageToS3 } from '../imgeUpload';

export default function ImageEditor2({
  albumId,
  data,
  isCreator,
  setSlideData,
  order,
}) {
  const [elements, setElements] = useState(data?.url ? data.url.split(',') : []);

  useEffect(() => {
    if (data?.url) {
      setElements(data.url?.split(',') || []);
    }
  }, [data.url])

  const saveOverride = (url, epoch) => {
    setElements(state => [ ...state, { dataURI: url, epoch } ]);
    // setSlideData(
    //   state => state.map(el => el.id === data.id ? {...el, url } : el ),
    // )
  };

  const saveElementsToS3 = () => {
    // elements.forEach(el =>
      UploadImageToS3(
        elements[0].dataURI,
        elements[0].epoch,
        () => UploadImageToS3(
          elements[1].dataURI,
          elements[1].epoch,
          () => UploadImageToS3(
            elements[2].dataURI,
            elements[2].epoch,
            () => saveCollage(),
          ),
        ),
      )
    // );
  };

  const saveCollage = async () => {
    const dataObj = {
      album_id: [albumId],
      type: data.type,
      url: elements.map(el => epochToS3URL(el.epoch)).join(','),
      order,
    };
    let res = await fetcher('/self/photo/save', { method: 'POST', body: dataObj });
    if (res?.[0]?.id) {
      setSlideData(
        state => state.map(el => el.id === data.id ? res?.[0] : el ),
      )
      toast.success("picture saved!");
    }
  };

  const handleDelete = async () => {
    if (confirm("Want to delete?")) {
      let auxUrl = null;
      data.url?.split(',').map((el, index) => {
        auxUrl = el.split('/');
        // console.log("DEL CHECK",splitUrl)
        auxUrl = `${auxUrl[auxUrl.length - 2]}/${auxUrl[auxUrl.length - 1]}`
        DeleteImageFromS3(
          auxUrl,
          async () => {
            if (index === 2) {
              let res = await fetcher(`/self/photo/delete/${data.id}`, { method: 'POST' });
              if (res?.deleted) {
                setSlideData(
                  state => state.filter(el => el.id !== data.id),
                )
                toast.success("photo deleted!");
              }
            }
          }
        );
      });
    }
  };
  
  return (
    <>
      <style jsx>
        {`
          .wrapper {
            gap: 16px;
          }
          .wrapper .save-all-btn {
            bottom: 37.5px;
            right: 0;
            background-color: #fff;
          }
          .wrapper .save-all-btn:hover {
            background-color: #000;
          }
        `}
      </style>
      <div className='d-flex wrapper relative'>
        {['a', 'b', 'c'].map((el, index) => (
          <div style={{ flex: 1 }} key={`${data?.id}${el}`}>
            <ImageEditor
              key={`${data?.id}${el}`}
              data={{
                ...data,
                id: `${data?.id}${el}`,
                url: elements[index]?.dataURI ||  elements[index]
              }}
              albumId={albumId}
              setSlideData={setSlideData}
              isCreator={isCreator}
              order={order}
              aspectRatio={16/9}
              saveOverride={saveOverride}
            />
          </div>
        ))}
        {isCreator && (
          <>
            {!data?.url && elements.length === 3 && (
              <button onClick={saveElementsToS3} className='minimal-btn save-all-btn absolute w-100'>save</button>
            )}
            {data?.url && (
              <button
                className='minimal-btn danger save-all-btn absolute'
                onClick={handleDelete}
              >
                delete
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
