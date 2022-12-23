import React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLLAGE_CONFIG } from '../../utils';

class StructureSelect extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      showSelector: Boolean(this.props.data.type || this.props.veryFirst),
      addMoreHover: false,
    };
  }
  
  elementData = this.props.data;

  componentDidUpdate(prevProps) {
    if (!this.elementData.type && (this.elementData.id !== prevProps.data.id)){
      this.setState({ showSelector: false });
    }
  }

  configSelectHandler = (id) => {
    console.log(id)
    this.props.setSlideData(
    state => state.map(
      i => i.id == this.elementData.id ?
        { id: this.elementData.id, type: parseInt(id,10) }
        : i
    )
  )};

  addMoreHandler = () => {
    if (this.props.isPrevSaved) {
      this.setState({ showSelector: true });
      this.props.setSlideData(state => ([...state, { id: state.length, type: null} ]));
    }
  }

  icon_map = {
    0: () => (
      <div>{'Heading <h1/>'}</div>
    ),
    3: () => (
      <div>{'Summary <p/>'}</div>
    ),
    1: () => (
      <div className="collage1" />
    ),
    2: () => (
      <div className="collage2">
        <div/>
        <div/>
        <div/>
      </div>
    )
  };

  render (){
    return (
      <>
        <style jsx>{`
          article {
            max-height: 50px;
            background-color: lightgrey;
            transition: max-height 0.3s ease-out;
            margin: 61.6px 0 60.8px;
          }
          article.selector-mode {
            max-height: ${CANVAS_HEIGHT}px;
          }
          .add-more {
            color: grey;
            text-align: center;
            padding: 16px 0;
            cursor: pointer;
            transition: color 0.2s ease-out;
            font-size: medium;
          }
          .add-more:hover {
            color: black;
            content: 'Please save your work'
          }
          .options-container {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            height: ${CANVAS_HEIGHT}px;
            cursor: pointer;
          }
          .options-container div {
            flex: 1;
            height: ${CANVAS_HEIGHT}px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .options-container div:hover {
            background-color: #ededed;
          }
          :global(.collage1) {
            border: 1px solid black;
            width: 100px;
            height: 50px;
          }
          :global(.collage2) {
            width: 100px;
            height: 50px;
            display: flex;
          }
          :global(.collage2 div) {
            flex: 1;
            border: 1px solid black;
          }
          .pointer-disabled {
            cursor: not-allowed;
            pointer-events: all !important;
          }
          @media (min-width: 992px) {
            article {
              width: ${CANVAS_WIDTH};
            }
            .options-container {
              flex-direction: row;
            }
          }
        `}</style>
        <article className={this.state.showSelector && 'selector-mode'}>
          {this.state.showSelector ? (
            <div className='options-container'>
              {Object.keys(this.icon_map).map(id => (
                <div key={id} onClick={() => this.configSelectHandler(id)}>
                  {this.icon_map[id]()}
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`add-more ${!this.props.isPrevSaved && "pointer-disabled"}`}
              onClick={this.addMoreHandler}
              onMouseEnter={() => this.setState({ addMoreHover: true })}
              onMouseLeave={() => this.setState({ addMoreHover: false })}
            >
              {!this.props.isPrevSaved && this.state.addMoreHover ? "you have unsaved work above" : "+ add more"}
            </div>
          )}
        </article>
      </>
    );
  };
}

export default StructureSelect;