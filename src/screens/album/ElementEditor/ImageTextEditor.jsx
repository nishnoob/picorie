import { useState } from "react";
import ContentEditable from "react-contenteditable";
import { toast } from "react-hot-toast";
import { ELEMENTS_ENUM } from ".";
import fetcher from "../../../utils/fetcher";
import ImageEditor from "./ImageEditor";

const ImageTextEditor = ({
  albumId,
  data,
  order,
  setSlideData = () => undefined,
  isCreator,
}) => {
  const [value, setValue] = useState('');
  const [img, setImg] = useState('');
  const isSaved = data?.content && data?.url;

  const handleSave = async () => {
    let res = await fetcher('/self/photo/save', { method: 'POST', body: {
      content: value,
      url: img,
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

  const saveOverride = (url) => setImg(url);

  return (
    <>
      <style jsx>
        {`
          .wrapper {
            pointer-events: ${isSaved ? 'none' : 'auto'};
            transition: all 0.2s ease-in-out;
            padding: 48px 0;
          }
          .wrapper:hover {
            background-color: ${isSaved ? 'lightgrey' : 'none'};
          }
          .wrapper :global(.minimal-btn.danger) {
            pointer-events: auto;
          }
          .controls {
            padding: 16px 0;
            display: flex;
            justify-content: space-between;
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
      <div className="wrapper">
        {isCreator && (
          <div className={`controls ${isSaved && 'opacity-0'}`}>
            <button onClick={() => setSlideData(state => state.map(el => el.id === data.id ? { id: el.id, type: null } : el ))}>
              &#x21BA; reset
            </button>
          </div>
        )}
        <div className="d-flex align-center">
          <article className={`header-text-container ${isSaved && 'saved'}`}>
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
              url: data.url || img
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
          <div className='controls'>
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