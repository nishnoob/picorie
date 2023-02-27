import { useEffect, useRef, useState } from "react";
import ContentEditable from "react-contenteditable";
import { toast } from "react-hot-toast";
import { ELEMENTS_ENUM } from ".";
import fetcher from "../../../utils/fetcher";

export const SimpleTextEditor = ({
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
            padding: 48px 0;
            height: fit-content;
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
          .header-text-container:not(.saved) {
            background-color: lightgrey;
            padding: 16px;
          }
          .header-text-container :global(div),
          .header-text-container :global(p) {
            outline: none;
            width: 100%;
            min-height: 100px;
            font-size: 24px;
            padding: 0 10vw;
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
        <article className={`text-center header-text-container ${isSaved && 'saved'}`}>
          {isSaved ? (
            <p dangerouslySetInnerHTML={{__html: data.content}}></p>
          ) : (
            <ContentEditable
              innerRef={inputRef}
              html={value}
              onChange={handleChange}
              onPaste={pasteAsPlainText}
            />
          )}
        </article>
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