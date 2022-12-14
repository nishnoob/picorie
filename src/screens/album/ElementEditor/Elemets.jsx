export const HeaderTextEditor = ({ data }) => {

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
            height: 200px;
            width: 500px;
          }
          @media (min-width: 992px) {
          }
        `}
      </style>
      <>
        <div className={`controls ${this.props.isSaved && 'opacity-0'}`}>
          <button onClick={() => this.props.setSlideData(state => state.map(el => el.id === this.props.id ? { id: el.id, type: null } : el ))}>
            &#x21BA; reset
          </button>
        </div>
        <article className='header-text-container'>
          <div contentEditable></div>
        </article>
        <div className='controls'>
          <div></div>
          {this.props.isSaved ? (
            <div className='saved-tag'>
              &#10059; saved
            </div>
            ) : (
            <button
              className='save-btn'
              onClick={this.handleSave}
              disabled={this.props.isSaved}
            >
              save
            </button>
          )}
        </div>
      </>
    </>
  );
};