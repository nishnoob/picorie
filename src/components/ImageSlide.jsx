import React from 'react';
import Konva from 'konva';
import StructureSelect from './StructureSelect';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLLAGE_CONFIG } from './utils';

export default class ImageSlide extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      whiteText: false,
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
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.type !== this.props.type && this.props.type) {
      this.init();
    }
    if (prevState.whiteText !== this.state.whiteText && this.state.elements.text1?.node) {
      this.state.elements.text1.node.fill(this.state.whiteText ? 'white' : 'black');
      this.addToLayerAndRedraw(this.state.elements.text1.node);
    }
  }
  
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
        rectVar.on('mouseenter', () => {
          this.stageRef.current.container().style.cursor = 'pointer';
        });
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

  setSelectedImage = (file) => {
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
        this.addToLayerAndRedraw(this.state.transformer, this.state[this.state.selectedImage.name].group);
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
      x: 50,
      y: 80,
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

  handleSave = () => {
    this.state.transformer.nodes([]);
    this.addToLayerAndRedraw(this.state.transformer);
    const dataURL = this.stageRef.current.toDataURL();
    this.props.setSlideData(state => state.map(el => el.id === this.props.id ? { ...el, output: dataURL } : el ));
    this.stageRef.current.destroy();
  };

  render () {
    const parsedId = parseInt(this.props.id + 1, 10);
    const orderStr = `${parsedId < 10 ? "0" : ""}${parsedId}`;
    return (
      <>
        <style jsx>
          {`
            .wrapper {
              position: relative;
            }
            .order-str {
              font-size: 84px;
              color: lightgrey;
              position: absolute;
              right: -70px;
              top: 48px;
              font-style: italic;
              z-Index: 0;
            }
            .wrapper:hover .controls button,
            .wrapper:hover .controls input,
            .wrapper:hover .controls label
            {
              opacity: 1;
            }
            .controls {
              padding: 8px 0;
              display: flex;
              justify-content: space-between;
            }
            .controls div {
            }
            .controls input, .controls label {
              opacity: 0;
            } 
            .controls label {
              color: grey;
              font-size: 14px;
              background-color: transparent;
              border-radius: 2px;
              letter-spacing: 0.5px;
              padding: 6px 9px;
            }
            .controls label input {
              margin: 0 4px 0 0;
              position: relative;
              bottom: -2px;
            }
            .controls label:hover {
              background-color: lightgrey;
              cursor: pointer;
            }
            .controls button {
              border: none;
              color: grey;
              background-color: transparent;
              border-radius: 2px;
              padding: 6px 9px;
              font-size: 14px;
              letter-spacing: 0.5px;
              transition: background-color 0.2s ease;
              opacity: 0;
            }
            .controls button:hover {
              background-color: lightgrey;
              cursor: pointer;
            }
            .controls .save-btn {
              opacity: 1;
            }
            .controls .saved-tag {
              color: green;
              font-size: 14px;
              letter-spacing: 0.5px;
            }
            .slide-container {
              /* box-shadow: 0px 0px 7px 0px rgba(0,0,0,0.25); */
              background-color: white;
            }
            input[type=file] {
              display: none;
            }
            .controls button:disabled {
              cursor: not-allowed;
              pointer-events: all !important;
            }
            .controls button:disabled:hover {
              cursor: not-allowed;
              pointer-events: all !important;
              background-color: transparent;
            }
            .opacity-0 {
              opacity: 0;
            }
          `}
        </style>
        <div className="wrapper">
          {this.props.type && <div className="order-str">{orderStr}</div>}
          {!this.props.type ? (
              <StructureSelect
                id={this.props.id}
                veryFirst={this.props.veryFirst}
                type={this.props.type}
                isSaved={this.props.isSaved}
                isPrevSaved={this.props.slideData[this.props.prevIndex]?.output}
                setSlideData={this.props.setSlideData}
                setElements={val => this.setState(state => ({ elements: [...state.elements, val] }))}
              />
            ) : (
            <>
              <div className={`controls ${this.props.isSaved && 'opacity-0'}`}>
                <button onClick={() => this.props.setSlideData(state => state.map(el => el.id === this.props.id ? { id: el.id, type: null } : el ))}>
                  &#x21BA; reset
                </button>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={this.state.whiteText}
                      onChange={() => this.setState(state => ({ whiteText: !state.whiteText}))}
                    />
                    white text
                  </label>
                  <button
                    disabled={this.state.preview || this.state.elements.text1}
                    onClick={() => {
                      this.addText();
                    }}
                  >
                    + text
                  </button>
                </div>
              </div>
              <article id={`slide-container-${this.props.id}`} className='slide-container'>
                {this.props.isSaved && (
                  <img src={this.props.output} />
                )}
              </article>
              <div className='controls'>
                <div></div>
                {/* <button
                  onClick={this.handlePreview}
                >
                  {this.state.preview ? "edit" : "preview"}
                </button> */}
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
              <input type="file" ref={this.uploadRef} onChange={(e) => this.setSelectedImage(e.target.files[0])} />
            </>
          )}
        </div>
      </>
    );
  };
}
