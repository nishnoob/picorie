import { useEffect, useState } from "react";
import ContentEditable from "react-contenteditable";
import { toast } from "react-hot-toast";
import { epochToS3URL } from "../../../utils";
import fetcher from "../../../utils/fetcher";
import { DeleteImageFromS3, UploadImageToS3 } from "../imgeUpload";
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
  const [triggerDestroy, setTriggerDestroy] = useState(false);
  const [img, setImg] = useState({ url: data.url });
  const isSaved = (data?.content != undefined) && (data?.url != undefined);

  useEffect(() => {
    if (data?.url) {
      setImg({ url: data.url });
    }
  }, [data?.url])

  const handleSave = async () => {
    if (value.length > 0 && img?.epoch) {
      setTriggerDestroy(true);
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
    } else {
      toast.error('Cannot leave text empty!')
    }
  };

  const handleDelete = async () => {
    if (confirm("Want to delete?")) {
      let splitUrl = data.url.split('/');
      splitUrl = `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1]}`
      DeleteImageFromS3(
        splitUrl,
        async () => {
          let res = await fetcher(`/self/photo/delete/${data.id}`, { method: 'POST' });
          if (res?.deleted) {
            setSlideData(
              state => state.filter(el => el.id !== data.id),
            )
            toast.success("text deleted!");
          }
        },
      );
    }
  };

  const handleChange = evt => {
    setValue(evt.target.value);
  };

  const saveOverride = (url, epoch) => setImg({dataURI: url, epoch});

  const pasteAsPlainText = (event) => {
    event.preventDefault()
  
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertHTML', false, text)
  }

  return (
    <>
      <style jsx>
        {`
          .wrapper {
            pointer-events: ${isSaved ? 'none' : 'auto'};
            transition: all 0.2s ease-in-out;
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
            transform: scale(${isSaved ? 0.96 : 1});
          }
          .controls {
            padding: 16px;
            display: flex;
            justify-content: end;
            left: 0;
            right: 0;
            z-index: 2;
            top: 0;
          }
          .controls.last {
            top: auto;
            bottom: 0;
          }
          .header-text-container {
            margin-right: 24px;
            height: fit-content;
            flex: 1;
          }
          .header-text-container:not(.saved) {
            background-color: lightgrey;
            padding: 16px;
          }
          .header-text-container :global(div),
          .header-text-container :global(p) {
            outline: none;
            width: 100%;
            font-size: 24px;
          }
          .header-text-container :global(div) {
            min-height: 60vh;
          }
          .wrapper :global(.wrapper) {
            min-width: 50%;
            text-align: center;
          }
          @media (min-width: 992px) {
          }
        `}
      </style>
      <div className="wrapper relative">
        {isCreator && (
          <div className={`controls ${isSaved && 'opacity-0'} absolute`}>
            <button className="minimal-btn" onClick={() => setSlideData(state => state.map(el => el.id === data.id ? { id: el.id, type: null } : el ))}>
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
                onPaste={pasteAsPlainText}
              />
            )}
          </article>
          <ImageEditor
            key={`${data?.id}a`}
            data={{
              ...data,
              id: `${data?.id}a`,
              url: isSaved ? (img.url || img.dataURI) : null
            }}
            albumId={albumId}
            setSlideData={setSlideData}
            isCreator={isCreator}
            order={order}
            aspectRatio={3/4}
            saveOverride={saveOverride}
            triggerDestroy={triggerDestroy}
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
                className='minimal-btn save-btn'
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