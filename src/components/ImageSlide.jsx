import React from 'react';
import Konva from 'konva';

export default class ImageSlide extends React.Component {
  constructor(props) {
    super(props);
    this.uploadRef = React.createRef();
    this.stageRef = React.createRef();
    this.layerRef = React.createRef();
    this.rect1Ref = React.createRef();
  }

  componentDidMount() {
    // this.canvasRef.value = new fabric.Canvas('image-canvas');
    // canvas.crea
    this.stageRef.current = new Konva.Stage({
      container: 'slide-container',
      width: 1200,
      height: 400,
    });
    this.layerRef.current = new Konva.Layer();


    this.rect1Ref.current = new Konva.Rect({
      x: 1,
      y: 1,
      width: 300,
      height: 398,
      stroke: 'black',
      strokeWidth: 4,
      // fillPatternImage:  img,
      // fillPatternScaleY: 300/img.height,
      // fillPatternScaleX: 300/img.width,
    });
    this.rect1Ref.current.on('click', () => {
      this.uploadRef.current.click()
      // this.setSelectedImage()
    })

    this.layerRef.current.add(this.rect1Ref.current)
    this.stageRef.current.add(this.layerRef.current);
  }

  setSelectedImage(file) {
    console.log(file)
    try {

    
    // const fileReader = new FileReader();
    const img = new Image;
    img.src = URL.createObjectURL(file);
    console.log('hua', img)
    img.onload = () => {
      var img_width = img.width;
      var img_height = img.height;

      // calculate dimensions to get max 300px
      var max = 300;
      var ratio = (img_width > img_height ? (img_width / max) : (img_height / max))
      this.rect1Ref.current = this.rect1Ref.current.fillPatternImage(img);
    }
    this.layerRef.current.add(this.rect1Ref.current)
    this.stageRef.current.add(this.layerRef.current);
    // fileReader.onload = () => {



      // var stage = new Konva.Stage({
      //   container: 'slide-container',
      //   width: 1200,
      //   height: 400,
      // });
  
      // var layer = new Konva.Layer();
      // stage.add(layer);
      // var rect1 = new Konva.Rect({
      //   x: 0,
      //   y: 0,
      //   width: 300,
      //   height: 300,
      //   stroke: 'black',
      //   strokeWidth: 4,
      //   fillPatternImage:  img,
      //   fillPatternScaleY: 300/img.height,
      //   fillPatternScaleX: 300/img.width,
      // });
      // console.log(img.height)
      // add the shape to the layer
      // layer.add(rect1);
      // alternative API:
      // Konva.Image.fromURL(fileReader.result, function (darthNode) {
      //   darthNode.setAttrs({
      //     x: 200,
      //     y: 50,
      //     scaleX: 0.5,
      //     scaleY: 0.5,
      //   });
      //   layer.add(darthNode);
      // });
      // fabric.Image.fromURL('http://www.socwall.com/images/wallpapers/74678-1920x1080.jpg', (image) => {
      //   image.scale(0.5);
      //   image.set({
      //     left: 0,
      //     top: 0,
      //     hoverCursor: 'default',
      //     // clipTo: function(ctx) {
      //     //   return clipBySlot(ctx, image, slot1);	 
      //     // }
      //   })
          
      //   this.canvasRef.value.add(image);
      //   //this.canvasRef.value.add(slot1);
      //   this.canvasRef.value.renderAll();
      // });
    // };
    // fileReader.readAsDataURL(file);
    }
    catch (e) {
      console.log(e)
    }
  }

  render () {
    return (
      <>
        <style jsx>
          {`
            .slide-container {
              border: 1px dotted;
            }
            .input {
              display: none;
            }
          `}
        </style>
        <article id='slide-container' className='slide-container'>
          <input type="file" ref={this.uploadRef} onChange={(e) => this.setSelectedImage(e.target.files[0])} />
        </article>
      </>
    );
  };
}
