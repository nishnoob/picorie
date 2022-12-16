import { useState } from "react";
import ContentEditable from "react-contenteditable";
import { toast } from "react-hot-toast";
import fetcher from "../../../utils/fetcher";

export const HeaderTextEditor = ({
  albumId,
  data,
  setSlideData = () => undefined,
}) => {
  const [value, setValue] = useState('');
  const isSaved = data?.url;

  const handleSave = async () => {
    let res = await fetcher('/self/text/save', { method: 'POST', body: {
      content: value,
      album_id: [albumId],
    } });
    if (res.length) {
      toast.success("text saved!");
    }
  };

  const handleChange = evt => {
    setValue(evt.target.value);
  };

  return (
    <>
      <style jsx>
        {`
          .controls {
            padding: 8px 0;
            display: flex;
            justify-content: space-between;
          }
          .controls .saved-tag {
            color: green;
            font-size: 14px;
            letter-spacing: 0.5px;
          }
          .header-text-container {
            background-color: lightgrey;
            padding: 16px;
          }
          .header-text-container :global(div) {
            outline: none;
            width: 100%;
            min-height: 100px;
            font-size: 24px;
          }
          @media (min-width: 992px) {
          }
        `}
      </style>
      <>
        <div className={`controls ${isSaved && 'opacity-0'}`}>
          <button onClick={() => setSlideData(state => state.map(el => el.id === data.id ? { id: el.id, type: null } : el ))}>
            &#x21BA; reset
          </button>
        </div>
        <article className='header-text-container'>
          <ContentEditable
            html={value}
            onChange={handleChange}
          />
        </article>
        <div className='controls'>
          <div></div>
          {isSaved ? (
            <div className='saved-tag'>
              &#10059; saved
            </div>
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
      </>
    </>
  );
};