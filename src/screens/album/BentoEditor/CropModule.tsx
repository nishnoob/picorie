import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Block } from "..";
import ReactCrop, { Crop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css'

type Props = {
  block: Block;
  setCropBlock: Dispatch<SetStateAction<Block>>;
  rowHeight: number;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
};

const CropModule = ({ block, setCropBlock, rowHeight, setBlocks }: Props) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: block.x,
    y: block.y,
    width: block.w * rowHeight,
    height: block.h * rowHeight + 5,
  });
  const imageRef = useRef(null);

  const onCropComplete = () => {
    makeClientCrop();
  };

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCancel = () => {
    setCropBlock({
      i: "",
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      p_img: ""
    });
    setCrop({
      unit: "px",
      x: 0,
      y: 0,
      width: 50,
      height: 50
    });
  };

  const makeClientCrop = async () => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(
        imageRef.current,
        crop,
        "newFile.jpeg"
      );
      if (!croppedImageUrl) {
        return;
      }
      setCropBlock((state: Block) => {
        searchAndUpdateBlock({
          ...state,
          p_img: croppedImageUrl
        } as Block);
        return({
          i: "",
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          p_img: ""
        });
      });
    }
  }

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop,
    fileName: string
  ): Promise<string | ArrayBuffer> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    // console.log("ctx", crop);
    if (!ctx) return Promise.resolve("");
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
        // blob.name = fileName;
        const reader = new FileReader();
        reader.onload = () => {
          if (!reader.result) return;
          resolve(reader.result);
        }
        reader.readAsDataURL(blob);
      }, "image/jpeg");
    });
  }

  const searchAndUpdateBlock = (block: Block) => {
    setBlocks((state) => {
      return state.map((b) => {
        if (b.i === block.i) {
          return {
            ...block,
            p_img: block.p_img,
          };
        }
        return b;
      });
    });
  }

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 bg-black/80 flex justify-center items-start">
      <div className="pt-8 flex flex-col items-center h-screen">
        <h2 className="text-2xl font-bold text-white">Crop Image</h2>
        <div className="flex-1 w-full flex items-center">
          
          <ReactCrop
            crop={crop}
            ruleOfThirds
            onChange={onCropChange}
            aspect={crop.width/crop.height}
            className="w-2/3 mx-auto"
          >
            <img ref={imageRef} src={block.p_img} alt="img" />
          </ReactCrop>
        </div>
        <div className="flex w-full gap-2 mt-4 pb-2 px-2">
          <button className="flex-1 w-full border border-gray-300 text-gray-300 shadow py-2" onClick={onCancel}>Close</button>
          <button className="flex-1 w-full bg-gray-300 shadow py-2" onClick={onCropComplete}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default CropModule;