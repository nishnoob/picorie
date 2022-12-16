export const HeaderTextEditor = ({
  data,
  setSlideData = () => undefined,
  handleSave = () => undefined,
}) => {
  const isSaved = data?.url;
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
          .header-text-container div {
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
          <div contentEditable></div>
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