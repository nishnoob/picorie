import React from 'react';
import StructureSelect from '../StructureSelect';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../utils';
import { HeaderTextEditor } from './HeaderTextEditor';

export const ELEMENTS_ENUM = {
  HEADER_TEXT: 0,
  BASIC_IMAGE: 1,
};

export default class ElementEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      whiteText: false,
      structureBorder: false,
      preview: false,
      elements: {},
    };
    this.newSlide = !this.props.type;
  }

  elementData = this.props.data;

  renderElement = () => {
    const RENDER = {
      0: (
        <HeaderTextEditor
          key={this.elementData.id}
          data={this.elementData}
          albumId={this.props.albumId}
          order={this.props.order}
          setSlideData={this.props.setSlideData}
        />
      ),
    };
    return RENDER[this.elementData.type];
  };

  render () {

    return (
      <>
        <style jsx>
          {`
            .wrapper {
              position: relative;
            }
            .order-str {
              position: relative;
              font-size: 54px;
              color: lightgrey;
              position: absolute;
              right: 10px;
              top: 8px;
              font-style: italic;
              z-Index: 1;
            }
            .order-str sup {
              position: absolute;
              top: 0px;
              left: -4px;
              font-size: 24px;
              font-weight: 900;
            }
            .wrapper:hover :global(.controls button),
            .wrapper:hover :global(.controls input),
            .wrapper:hover :global(.controls label)
            {
              opacity: 1;
            }
            .dummy-mob-backdrop {
              height: ${Math.abs(CANVAS_HEIGHT - CANVAS_WIDTH)}px;
              width: ${CANVAS_HEIGHT}px;
            }
            @media (min-width: 992px) {
              .wrapper {
                height: auto;
              }
              .order-str {
                font-size: 84px;
                right: -70px;
                top: 48px;
              }
            }
          `}
        </style>
        <div className="wrapper">
          {/* {elementData.type !== null && <div className="order-str"><sup>#</sup>{orderStr}</div>} */}
          {this.elementData.type === null ? (
            <StructureSelect
              data={this.elementData}
              veryFirst={this.props.veryFirst}
              isPrevSaved={this.props.isPrevSaved}
              setSlideData={this.props.setSlideData}
            />
          ) : (
            this.renderElement()
          )}
        </div>
      </>
    );
  };
}
