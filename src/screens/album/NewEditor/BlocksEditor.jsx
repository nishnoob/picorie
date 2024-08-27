
import React from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import ReactCrop from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css'

const ResponsiveGridLayout = WidthProvider(GridLayout)

class BlocksEditor extends React.Component {
  state = {
    cropBlock: {},
    crop: {
      unit: "%",
      x: 0,
      y: 0,
      width: 50,
      height: 50
    }
  };

  imageRef = React.createRef(null);

  onSelectCropFile = (block) => {
    this.setState({ cropBlock: block });
  }

  onImageLoaded = image => {
    this.imageRef = image;
  };

  onCropComplete = () => {
    console.log("CROP COMPLETE", this.imageRef);
    this.makeClientCrop();
  };

  onCropChange = (crop, percentCrop) => {
    // You could also use percentCrop:
    // this.setState({ crop: percentCrop });
    this.setState({ crop });
  };

  async makeClientCrop() {
    if (this.imageRef.current && this.state.crop.width && this.state.crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef.current,
        this.state.crop,
        "newFile.jpeg"
      );

      
      // this.setState(state => {
      //   const newBlocks = state.blocks.map(block => {
      //     if (block.id === state.cropBlock.id) {
      //       return {
      //         ...block,
      //         p_img: croppedImageUrl
      //       }
      //     }
      //     return block;
      //   })
      //   return { blocks: newBlocks, cropBlock: {} }
      // })
      this.setState(state => {
        this.props.searchAndUpdateBlock({
          ...state.cropBlock,
          p_img: croppedImageUrl
        });
        return({...state, cropBlock: {} })
      });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    console.log("ctx", crop);
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }
        blob.name = fileName;
        // window.URL.revokeObjectURL(this.fileUrl);
        // this.fileUrl = window.URL.createObjectURL(blob);
        // new File
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        }
        reader.readAsDataURL(blob);
      }, "image/jpeg");
    });
  }

  render() {
    const { crop, croppedImageUrl, cropBlock } = this.state;

    return (
      <div className="w-screen">
        <ResponsiveGridLayout
          className="layout "
          layout={this.props.blocks}
          cols={2}
          draggableCancel=".cancelSelectorName"
        >
          {this.props.blocks.map((block, index) => (
            <div key={block.id} className="bg-green-500 overflow-cli relative">
              <img src={block.p_img} alt="img" />
              <div className="cancelSelectorName absolute top-0 right-0 bg-red-400" onTouchEnd={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); console.log("CROPP"); this.onSelectCropFile(block); }}>CROP</div>
            </div>
          ))}
          {/* <div key="b" className="bg-red-500">b</div>
          <div key="c" className="bg-blue-500">c</div> */}
          
        </ResponsiveGridLayout>
        {cropBlock.p_img && (
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-gray-600/50 flex justify-center items-center">
            <div className="w-3/4 py-4 h-3/4">
              <ReactCrop
                src={cropBlock.p_img}
                crop={crop}
                ruleOfThirds
                onImageLoaded={this.onImageLoaded}
                onChange={this.onCropChange}
              >
                <img ref={this.imageRef} src={cropBlock.p_img} alt="img" />
              </ReactCrop>
              <button className="" onClick={() => this.onCropComplete()}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export { BlocksEditor };