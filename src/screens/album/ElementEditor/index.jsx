import React from 'react';
import Konva from 'konva';
import StructureSelect from '../StructureSelect';
import { BORDER_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH, COLLAGE_CONFIG } from '../../../utils';
import UploadImageToS3 from '../imgeUpload';
import { HeaderTextEditor } from './elemets';

export default class ElementEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      whiteText: false,
      structureBorder: false,
      preview: false,
      elements: {},
    };
    this.uploadRef = React.createRef();
    this.stageRef = React.createRef();
    this.layerRef = React.createRef();
    this.groupRef = React.createRef();
    this.newSlide = !this.props.type;
  }

  componentDidMount() {
    this.init();
  }

  calculateWidth = (val1, val2, opposite = false) => opposite ?
    this.state.structureBorder ? val1 - val2 : val1 + val2:
    this.state.structureBorder ? val1 + val2 : val1 - val2;
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.type !== this.props.type && this.props.type) {
      this.init();
    }
    if (prevState.whiteText !== this.state.whiteText && this.state.elements.text1?.node) {
      this.state.elements.text1.node.fill(this.state.whiteText ? 'white' : 'black');
      this.addToLayerAndRedraw(this.state.elements.text1.node);
    }
    if (prevState.structureBorder !== this.state.structureBorder && this.state.elements.pic1?.group) {
      Object.values(this.state.elements).forEach((el, index) => {
        if (el.group) {
          const clipX = index === 0 ? this.calculateWidth(el.group.clipX(), BORDER_WIDTH) : el.group.clipX();
          const clipY = this.calculateWidth(el.group.clipY(), BORDER_WIDTH);
          const clipWidth = index === 0 ? this.calculateWidth(el.group.clipWidth(), 2 * BORDER_WIDTH, true) : this.calculateWidth(el.group.clipWidth(), BORDER_WIDTH, true);
          const clipHeight = this.calculateWidth(el.group.clipHeight(), 2 * BORDER_WIDTH, true);
          el.group.clipX(clipX)
          el.group.clipY(clipY)
          el.group.clipHeight(clipHeight)
          el.group.clipWidth(clipWidth)
          this.addToLayerAndRedraw(el.group);
        }
      })
      // this.state.elements.pic1.group.stroke('white');
      // this.state.elements.pic1.group.strokeWidth('5');
    }
  }

  addCursorStyle = (node, cursorStyle = 'pointer') => {
    node.on('mouseenter', () => {
      this.stageRef.current.container().style.cursor = cursorStyle;
    });

    node.on('mouseleave', () => {
      this.stageRef.current.container().style.cursor = 'default';
    });
  };
  
  init = () => {
    if (document.getElementById(`slide-container-${this.props.id}`) && !this.props.isSaved) {
      let groupVar = null;
      let rectVar = null;
      let textVar = null;
      let stateObj = {};
      
      this.stageRef.current = new Konva.Stage({
        container: `slide-container-${this.props.id}`,
        width: COLLAGE_CONFIG[this.props.type].canvasWidth,
        height: COLLAGE_CONFIG[this.props.type].canvasHeight,
      });
      this.layerRef.current = new Konva.Layer();
      const bgLayer = new Konva.Layer();
      const bgRectangle = new Konva.Rect({
        fill: 'white',
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      });
      bgLayer.add(bgRectangle);
      this.stageRef.current.add(bgLayer);

      COLLAGE_CONFIG[this.props.type]?.frames.forEach(el => {
        groupVar = new Konva.Group({
          clip: {
            x: el.x,
            y: 0,
            width: el.frameWidth,
            height: COLLAGE_CONFIG[this.props.type].canvasHeight,
          },
        });
        rectVar = new Konva.Rect({
          x: el.x,
          y: 0,
          width: el.frameWidth,
          height: COLLAGE_CONFIG[this.props.type].canvasHeight,
          fill: 'lightgrey',
          stroke: 1,
        });
        rectVar.on('click', () => {
          if (!this.state.preview) {
            this.uploadRef.current.click();
            this.setState({ selectedImage: el });
          }
        })
        this.addCursorStyle(rectVar);
        
        textVar = new Konva.Text({
          text: 'Click to upload',
          x: el.x + ( el.frameWidth / 2 - 70),
          y: COLLAGE_CONFIG[this.props.type].canvasHeight / 2,
          fontSize: 20,
        });
        groupVar.add(rectVar);
        groupVar.add(textVar);
        stateObj = {
          ...stateObj,
          [el.name]: {
            rect: rectVar,
            uploadText: textVar,
            group: groupVar,
          }
        };
        this.layerRef.current.add(groupVar);
      })
      const tr = new Konva.Transformer({
        nodes: [],
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      });
      this.setState({ elements: stateObj, transformer: tr });
      this.layerRef.current.add(tr);
      this.stageRef.current.add(this.layerRef.current);
    }
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

  addText() {
    var textNode = new Konva.Text({
      text: 'Some text here',
      fontFamily: "serif",
      fill: this.state.whiteText ? 'white' : 'black',
      x: 500,
      y: 300,
      fontSize: 20,
      draggable: true,
      width: 200,
    });

    this.state.transformer.setAttrs({
      node: textNode,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      // set minimum width of text
      boundBoxFunc: function (oldBox, newBox) {
        newBox.width = Math.max(30, newBox.width);
        return newBox;
      },
    });

    // textNode.on('transform', function () {
    //   // reset scale, so only with is changing by transformer
    //   textNode.setAttrs({
    //     width: textNode.width() * textNode.scaleX(),
    //     scaleX: 1,
    //   });
    // });

    this.addToLayerAndRedraw(textNode, this.state.transformer);
    this.setState(state => ({
      elements: {
        ...state.elements,
        text1: {
          node: textNode,
        }
      }
    }));
    textNode.on('click', () => {
      if (!this.state.preview) {
        this.state.transformer.nodes([textNode]);
        this.state.transformer.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
        // set minimum width of text
        this.state.transformer.boundBoxFunc(
          function (oldBox, newBox) {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }
        );
        this.addToLayerAndRedraw(this.state.transformer);
      }
    });
    textNode.on('dblclick dbltap', () => {
      if (!this.state.preview) {
        // hide text node and transformer:
        textNode.hide();
        this.state.transformer.hide();

        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        var textPosition = textNode.absolutePosition();

        // so position of textarea will be the sum of positions above:
        var areaPosition = {
          x: this.stageRef.current.container().offsetLeft + textPosition.x,
          y: this.stageRef.current.container().offsetTop + textPosition.y,
        };

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
        textarea.style.height =
          textNode.height() - textNode.padding() * 2 + 5 + 'px';
        textarea.style.fontSize = textNode.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = textNode.lineHeight();
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = textNode.align();
        textarea.style.color = textNode.fill();
        var rotation = textNode.rotation();
        var transform = '';
        if (rotation) {
          transform += 'rotateZ(' + rotation + 'deg)';
        }

        var px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        var isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
          px += 2 + Math.round(textNode.fontSize() / 20);
        }
        transform += 'translateY(-' + px + 'px)';

        textarea.style.transform = transform;

        // reset height
        textarea.style.height = 'auto';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + 'px';

        textarea.focus();

        const removeTextarea = () => {
          textarea.parentNode.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          textNode.show();
          this.state.transformer.show();
          this.state.transformer.forceUpdate();
        }

        const setTextareaWidth = (newWidth) => {
          if (!newWidth) {
            // set width for placeholder
            newWidth = textNode.placeholder.length * textNode.fontSize();
          }
          // some extra fixes on different browsers
          var isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );
          var isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
          if (isSafari || isFirefox) {
            newWidth = Math.ceil(newWidth);
          }

          var isEdge =
            document.documentMode || /Edge/.test(navigator.userAgent);
          if (isEdge) {
            newWidth += 1;
          }
          textarea.style.width = newWidth + 'px';
        }

        textarea.addEventListener('keydown', function (e) {
          // hide on enter
          // but don't hide on shift + enter
          if (e.keyCode === 13 && !e.shiftKey) {
            textNode.text(textarea.value);
            removeTextarea();
          }
          // on esc do not set value back to node
          if (e.keyCode === 27) {
            removeTextarea();
          }
        });

        textarea.addEventListener('keydown', function (e) {
          var scale = textNode.getAbsoluteScale().x;
          setTextareaWidth(textNode.width() * scale);
          textarea.style.height = 'auto';
          textarea.style.height =
            textarea.scrollHeight + textNode.fontSize() + 'px';
        });

        function handleOutsideClick(e) {
          if (e.target !== textarea) {
            textNode.text(textarea.value);
            removeTextarea();
          }
        }
        setTimeout(() => {
          window.addEventListener('click', handleOutsideClick);
        });
      };
    });
  }

  // handlePreview = () => this.setState(state => {
  //   if (!state.preview) {
  //     this.state.transformer.nodes([]);
  //     this.layerRef.current.add(this.state.transformer);
  //   }
  //   Object.values(this.state.elements).forEach(el => {
  //     if (el.img) {
  //       el.img.draggable(state.preview);
  //       el.group.add(el.img);
  //       this.layerRef.current.add(el.group);
  //     } else if (el.node) {
  //       el.node.draggable(state.preview);
  //       this.layerRef.current.add(el.node);      }
  //   });
  //   // COLLAGE_TEMPLATE.forEach(el => {
  //   //   if (this.state.elements[el.name].img) {
  //   //     this.state.elements[el.name].img.draggable(state.preview);
  //   //     this.state.elements[el.name].group.add(this.state[el.name].img);
  //   //     this.layerRef.current.add(this.state[el.name].group);
  //   //   } else if (this.state.elements[el.name].node) {
  //   //     this.state.elements[el.name].node.draggable(state.preview);
  //   //     this.layerRef.current.add(this.state.elements[el.name].node);
  //   //   }
  //   // })
  //   this.stageRef.current.add(this.layerRef.current);
  //   return ({ preview: !state.preview });
  // });

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
    const parsedId = parseInt(this.props.prevIndex + 2, 10);
    const orderStr = `${parsedId < 10 ? "0" : ""}${parsedId}`;
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
          {this.props.type !== null && <div className="order-str"><sup>#</sup>{orderStr}</div>}
          {this.props.type === null ? (
            <StructureSelect
              id={this.props.id}
              veryFirst={this.props.veryFirst}
              type={this.props.type}
              isSaved={this.props.isSaved}
              isPrevSaved={this.props.slideData[this.props.prevIndex]?.url}
              setSlideData={this.props.setSlideData}
              setElements={val => this.setState(state => ({ elements: [...state.elements, val] }))}
            />
          ) : (
            <HeaderTextEditor />
          )}
        </div>
      </>
    );
  };
}
