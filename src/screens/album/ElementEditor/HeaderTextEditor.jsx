import { useEffect, useRef, useState } from "react";
import ContentEditable from "react-contenteditable";
import { toast } from "react-hot-toast";
import fetcher from "../../../utils/fetcher";

export const HeaderTextEditor = ({
  albumId,
  data,
  order,
  setSlideData = () => undefined,
  isCreator,
}) => {
  const [value, setValue] = useState('');
  const isSaved = data?.content;
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const handleSave = async () => {
    let res = await fetcher('/self/text/save', { method: 'POST', body: {
      content: value,
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

  return (
    <>
      <style jsx>
        {`
          .wrapper {
            pointer-events: ${isSaved ? 'none' : 'auto'};
            transition: all 0.2s ease-in-out;
            height: fit-content;
          }
          .wrapper:hover {
            background-color: ${isSaved ? 'lightgrey' : 'none'};
          }
          .wrapper :global(.minimal-btn.danger) {
            pointer-events: auto;
          }
          .controls {
            padding: 16px;
            display: flex;
            justify-content: space-between;
            left: 0;
            right: 0;
          }
          .controls.last {
            bottom: 0;
          }
          .header-text-container {
            padding: 20vh 0;
          }
          .header-text-container:not(.saved) {
            background-color: lightgrey;
            padding: 16px;
          }
          .header-text-container h1 {
            font-size: 48px;
          }
          .header-text-container :global(div) {
            outline: none;
            width: 100%;
            min-height: 100px;
            font-size: 48px;
            text-align: center;
            margin-right: -16px;
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
        <article className={`header-text-container ${isSaved && 'saved'}`}>
          {isSaved ? (
            <h1 className="text-center" dangerouslySetInnerHTML={{__html: data.content}}></h1>
          ) : (
            <ContentEditable
              innerRef={inputRef}
              html={value}
              onChange={handleChange}
            />
          )}
        </article>
        {isCreator && (
          <div className='controls last absolute'>
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