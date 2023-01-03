import React, { useState } from 'react'
import { toast } from 'react-hot-toast';
import fetcher from '../../../utils/fetcher';
import ImageEditor from './ImageEditor';

export default function ImageEditor2({
  albumId,
  data,
  isCreator,
  setSlideData,
  order,
}) {
  const [elements, setElements] = useState(data?.url ? data.url.split(',') : []);

  const saveOverride = (url) => setElements(state => [ ...state, url ]);

  const saveCollage = async () => {
    const dataObj = {
      album_id: [albumId],
      type: data.type,
      url: elements.join(','),
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
        let res = await fetcher(`/self/photo/delete/${data.id}`, { method: 'POST' });
        if (res?.deleted) {
          setSlideData(
            state => state.filter(el => el.id !== data.id),
          )
          toast.success("photo deleted!");
        }
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
          <div style={{ flex: 1 }}>
            <ImageEditor
              key={`${data?.id}${el}`}
              data={{
                ...data,
                id: `${data?.id}${el}`,
                url: elements[index]
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
            {elements.length === 3 && !data?.url && (
              <button onClick={saveCollage} className='minimal-btn save-all-btn absolute w-100'>save</button>
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
