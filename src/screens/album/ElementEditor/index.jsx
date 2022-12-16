import React from 'react';
import Konva from 'konva';
import StructureSelect from '../StructureSelect';
import { BORDER_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH, COLLAGE_CONFIG } from '../../../utils';
import UploadImageToS3 from '../imgeUpload';
import { HeaderTextEditor } from './Elemets';

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

  calculateWidth = (val1, val2, opposite = false) => opposite ?
    this.state.structureBorder ? val1 - val2 : val1 + val2:
    this.state.structureBorder ? val1 + val2 : val1 - val2;
  
  componentDidUpdate(prevProps, prevState) {
  }

  addCursorStyle = (node, cursorStyle = 'pointer') => {
    node.on('mouseenter', () => {
      this.stageRef.current.container().style.cursor = cursorStyle;
    });

    node.on('mouseleave', () => {
      this.stageRef.current.container().style.cursor = 'default';
    });
  };

  addToLayerAndRedraw = (elements) => {
    this.layerRef.current.add(elements);
    this.stageRef.current.add(this.layerRef.current);
  }

  addImage = (file) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      let img1 = null
      img.onload = () => {
        var img_width = img.width;
        var img_height = img.height;

        // var widthRatio = 300 / img_width,
        var widthRatio = this.state.selectedImage.frameWidth / img_width
        // var bestRatio = Math.min(widthRatio, heightRatio)
        var newWidth = img_width * widthRatio,
            newHeight = img_height * widthRatio
        img1 = new Konva.Image({
          x: this.state.selectedImage.x,
          y: this.state.selectedImage.y,
          image: img,
          width: newWidth,
          height: newHeight,
          draggable: true,
        })
        this.addCursorStyle(img1, 'move');
        img1.on('mousedown', () => {
          if (!this.state.preview) {
            this.state.transformer.nodes([img1]);
            this.addToLayerAndRedraw(this.state.transformer, this.state.elements[this.state.selectedImage.name].group);
          }
        })
        this.setState(state => ({
          elements: {
            ...state.elements,
            [state.selectedImage.name]: {
              ...state.elements[state.selectedImage.name],
              img: img1,
            }
          }
        }));
        this.state.elements[this.state.selectedImage.name].group.destroyChildren();
        this.state.transformer.nodes([img1]);
        this.state.elements[this.state.selectedImage.name].group.add(img1);
        this.addToLayerAndRedraw(this.state.transformer, this.state.elements[this.state.selectedImage.name].group);
      }
    }
    catch (e) {
      console.log('error', e);
    }
  }

  handleSave = async () => {
    this.state.transformer.nodes([]);
    this.addToLayerAndRedraw(this.state.transformer);
    // const dataURL = this.stageRef.current.toDataURL({ pixelRatio: 2 });
    const dataURL = this.stageRef.current.toDataURL();
    const epoch = `_uploads_/${Date.now()}.jpeg`;
    UploadImageToS3(
      dataURL,
      epoch,
      () => {
        this.props.setSlideData(
          state => state.map(el => el.id === this.props.id ? { ...el, url: dataURL } : el ),
        )
        this.props.fetchCall({
          type: this.props.type,
          url: `https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/${epoch}`,
          album_id: [this.props.albumId],
        })
      }
    );
      this.stageRef.current.destroy();
  };

  render () {
    // const parsedId = parseInt(this.props.prevIndex + 2, 10);
    // const orderStr = `${parsedId < 10 ? "0" : ""}${parsedId}`;
    const elementData = this.props.data;
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
              .slide-container {
                transform: rotate(0deg) translateX(0px);
                height: auto;
                width: auto;
              }
            }
          `}
        </style>
        <div className="wrapper">
          {/* {elementData.type !== null && <div className="order-str"><sup>#</sup>{orderStr}</div>} */}
          {elementData.type === null ? (
            <StructureSelect
              id={elementData.id}
              veryFirst={this.props.veryFirst}
              type={elementData.type}
              isSaved={Boolean(elementData?.url)}
              isPrevSaved={this.props.isPrevSaved}
              setSlideData={this.props.setSlideData}
              setElements={val => this.setState(state => ({ elements: [...state.elements, val] }))}
            />
          ) : (
            <HeaderTextEditor data={this.props.data} />
          )}
        </div>
      </>
    );
  };
}
