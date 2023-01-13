import { useEffect, useState } from "react";
import ContentEditable from "react-contenteditable";
import { toast } from "react-hot-toast";
import { epochToS3URL } from "../../../utils";
import fetcher from "../../../utils/fetcher";
import UploadImageToS3 from "../imgeUpload";
import ImageEditor from "./ImageEditor";
//  TODO: add invert button
//  TODO: add 'wide' button
const ImageTextEditor = ({
  albumId,
  data,
  order,
  setSlideData = () => undefined,
  isCreator,
}) => {
  const [value, setValue] = useState('');
  const [img, setImg] = useState({ url: data.url });
  const isSaved = data?.content && data?.url;

  useEffect(() => {
    if (data?.url) {
      setImg({ url: data.url });
    }
  }, [data?.url])

  const handleSave = async () => {
    UploadImageToS3(
      img?.dataURI,
      img?.epoch,
      async () => {
        let res = await fetcher('/self/photo/save', { method: 'POST', body: {
          content: value,
          url: epochToS3URL(img?.epoch),
          album_id: [albumId],
          order,
          type: data.type,
        } });
        if (res?.[0]?.id) {
          setSlideData(
            state => state.map(el => el.id === data.id ? res?.[0] : el ),
          )
          toast.success("text saved!");
        }
      }
    );
  };

  const handleDelete = async () => {
    if (confirm("Want to delete?")) {
        let res = await fetcher(`/self/text/delete/${data.id}`, { method: 'POST' });
        if (res?.deleted) {
          setSlideData(
            state => state.filter(el => el.id !== data.id),
          )
          toast.success("text deleted!");
        }
    }
  };

  const handleChange = evt => {
    setValue(evt.target.value);
  };

  const saveOverride = (url, epoch) => setImg({dataURI: url, epoch});

  return (
    <>
      <style jsx>
        {`
          .wrapper {
            pointer-events: ${isSaved ? 'none' : 'auto'};
            transition: all 0.2s ease-in-out;
            {/* margin: 60px 0; */}
          }
          .wrapper:hover {
            background-color: ${isSaved ? 'lightgrey' : 'none'};
          }
          .wrapper :global(.minimal-btn.danger) {
            pointer-events: auto;
          }
          .align-ke-upar {
            transition: all 0.2s ease-in-out;
          }
          .wrapper:hover .align-ke-upar {
            transform: scale(${isSaved ? 0.96 : 0});
          }
          .controls {
            padding: 16px;
            display: flex;
            justify-content: space-between;
            left: 0;
            right: 0;
            z-index: 2;
            top: -60.5px;
          }
          .controls.last {
            top: auto;
            bottom: 0;
          }
          .header-text-container {
            width: 25%;
            margin-right: 24px;
            height: fit-content;
          }
          .header-text-container:not(.saved) {
            background-color: lightgrey;
            padding: 16px;
          }
          .header-text-container :global(div),
          .header-text-container :global(p) {
            outline: none;
            width: 100%;
            min-height: 60vh;
            font-size: 24px;
          }
          .wrapper :global(.wrapper) {
            flex: 1;
          }
          @media (min-width: 992px) {
          }
        `}
      </style>
      <div className="wrapper relative">
        {isCreator && (
          <div className={`controls ${isSaved && 'opacity-0'} absolute`}>
            <button onClick={() => setSlideData(state => state.map(el => el.id === data.id ? { id: el.id, type: null } : el ))}>
              &#x21BA; reset
            </button>
          </div>
        )}
        <div className="align-ke-upar d-flex align-center">
          <article className={`text-center header-text-container ${isSaved && 'saved'}`}>
            {isSaved ? (
              <p dangerouslySetInnerHTML={{__html: data.content}}></p>
            ) : (
              <ContentEditable
                html={value}
                onChange={handleChange}
              />
            )}
          </article>
          <ImageEditor
            key={`${data?.id}a`}
            data={{
              ...data,
              id: `${data?.id}a`,
              url: img.url || img.dataURI
            }}
            albumId={albumId}
            setSlideData={setSlideData}
            isCreator={isCreator}
            order={order}
            aspectRatio={3/4}
            saveOverride={saveOverride}
          />
        </div>
        {isCreator && (
          <div className='controls absolute last'>
            <div></div>
            {isSaved ? (
              <button
                className='minimal-btn danger'
                onClick={handleDelete}
              >
                delete
              </button>
              ) : (
              <button
                className='save-btn'
                onClick={handleSave}
                disabled={isSaved}
              >
                save
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ImageTextEditor;