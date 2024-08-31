
import React, { Dispatch, SetStateAction, useRef } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import ReactCrop, { Crop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css'
import AddButton from "./AddButton";
import { Block } from "..";

const ResponsiveGridLayout = WidthProvider(GridLayout);

interface Props {
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  searchAndUpdateBlock: (block: Block) => void;
}

const BentoEditor = ({ blocks, setBlocks, searchAndUpdateBlock }: Props) => {
  const [cropBlock, setCropBlock] = React.useState<Block>({
    i: "",
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    p_img: ""
  });
  const [crop, setCrop] = React.useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 50,
    height: 50
  });

  const imageRef = useRef<HTMLImageElement | null>(null);

  const onSelectCropFile = (block: Block) => {
    setCropBlock(block);
  }

  // const onImageLoaded = (image: HTMLImageElement) => {
  //   imageRef.current = image;
  // };

  const onCropComplete = () => {
    makeClientCrop();
  };

  const onCropChange = (crop: Crop) => {
    setCrop(crop);
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
    console.log("ctx", crop);
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

  return (
    <div className='h-screen overflow-scroll relative'>
      <div className="w-screen">
        <ResponsiveGridLayout
          className="layout "
          layout={blocks}
          cols={2}
          draggableCancel="#crop-button"
        >
          {blocks.map((block, index) => (
            <div key={block.i} data-grid={blocks[index]} className="border-2 border-gray-400 rounded overflow-clip relative">
              {block.p_img && (<img src={block.p_img} alt="img" />)}
              <div
                id="crop-button"
                className="cancelSelectorName absolute top-1 right-1 border rounded-full bg-white p-1"
                // onTouchEnd={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onSelectCropFile(block); }}
              >
                <CropIcons />
                {/* <i className="fa-solid fa-crop"></i> */}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
        {cropBlock.p_img && (
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-gray-600/50 flex justify-center items-center">
            <div className="w-3/4 py-4 h-3/4">
              <ReactCrop
                crop={crop}
                ruleOfThirds
                onChange={onCropChange}
              >
                <img ref={imageRef} src={cropBlock.p_img} alt="img" />
              </ReactCrop>
              <button className="" onClick={onCropComplete}>Close</button>
            </div>
          </div>
        )}
      </div>
      <AddButton setBlocks={setBlocks} />
    </div>
  );
}

const CropIcons = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-crop" viewBox="0 0 16 16">
    <path d="M3.5.5A.5.5 0 0 1 4 1v13h13a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2H3.5a.5.5 0 0 1-.5-.5V4H1a.5.5 0 0 1 0-1h2V1a.5.5 0 0 1 .5-.5m2.5 3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4H6.5a.5.5 0 0 1-.5-.5"/>
  </svg>
);

export { BentoEditor };