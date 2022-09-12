import React from 'react';

class ShareWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render(){
    return(
      <>
        <style jsx>{`
          .backdrop {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0,0,0,0.9);
            overflow-y: scroll;
            padding-bottom: 64px;
          }
          .backdrop::-webkit-scrollbar {
            display: none;
          }
          .content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .content img {
            padding-top: 64px;
          }
          .close-btn {
            position: absolute;
            top: 0;
            right: 0;
            background-color: darkgrey;
            padding: 6px 14px 10px;
          }
          .close-btn:hover {
            background-color: lightgrey;
            cursor: pointer;
          }
        `}</style>
        <div className="backdrop">
          <div className="content">
            {this.props.slideData.map(el => el.output && (
              <img key={el.id} src={el.output} />
            ))}
          </div>
          {this.props.onClose && <div className="close-btn" onClick={this.props.onClose}>&#10005;</div>}
        </div>
      </>
    );
  }
}

export default ShareWindow;