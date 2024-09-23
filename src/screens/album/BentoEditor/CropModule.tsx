import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Block } from "..";
import ReactCrop, { Crop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css'
import fetcher from "../../../utils/fetcher";
import { UploadImageToS3 } from "../imgeUpload";
import toast from "react-hot-toast";

type Props = {
  albumId: string;
  block: Block;
  setCropBlock: Dispatch<SetStateAction<Block>>;
  rowHeight: number;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  savedBlocks: React.MutableRefObject<Block[]>;
};

const CropModule = ({
  albumId,
  block,
  setCropBlock,
  rowHeight,
  setBlocks,
  savedBlocks
}: Props) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: block.x || 0,
    y: block.y || 0,
    width: (block.w * rowHeight),
    height: (block.h * rowHeight),
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

  const isThisNewBlock = () => {
    if (savedBlocks.current.find((b) => b.i === block.i)) {
      return false;
    }
    return true;
  };

  const getEpochFromUrl = (url: string) => {
    const arr = url.split('/');
    const last = arr[arr.length - 1];
    const epoch = last.split('.')[0];
    return epoch.replace('_cropped', '');
  }

  const makeClientCrop = async () => {
    if (imageRef.current && crop.width && crop.height) {
      // const croppedImageUrl = await getCroppedImg(
      //   imageRef.current,
      //   crop,
      //   "newFile.jpeg"
      // );
      // if (!croppedImageUrl) {
      //   return;
      // }
      if (isThisNewBlock()) {
        const epoch = `_uploads_/${Date.now()}`;
        // upload OG image to S3
        UploadImageToS3(
          block.p_img,
          `${epoch}.jpeg`,
          () => {
            // upload cropped image to S3
            getCroppedImg(
              imageRef.current,
              crop,
              "newFile.jpeg"
            ).then((res) => {
              UploadImageToS3(
                res as string,
                `${epoch}_cropped.jpeg`,
                () => {
                  saveNewBlockToBE(epoch);
                }
              );
            });
          },
        );
      } else {
        const epoch = `_uploads_/${getEpochFromUrl(block.p_img)}`;
        getCroppedImg(
          imageRef.current,
          crop,
          "newFile.jpeg"
        ).then((res) => {
          UploadImageToS3(
            res as string,
            `${epoch}_cropped.jpeg`,
            () => {
              // saveNewBlockToBE(epoch, block.p_img, res as string);
              setCropBlock((state: Block) => {
                searchAndUpdateBlock({
                  ...state,
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
          );
        });
      }
    }
  }

  const saveNewBlockToBE = async (epoch) => {
    const dataObj = {
      url: `https://s3.ap-south-1.amazonaws.com/picorie-assets/${epoch}.jpeg`,
      cropped_url: `https://s3.ap-south-1.amazonaws.com/picorie-assets/${epoch}_cropped.jpeg`,
      album_id: [albumId],
      x: 0,
      y: 0,
      h: 1,
      w: 1,
      crop_x: crop.x,
      crop_y: crop.y,
      crop_w: crop.width,
      crop_h: crop.height,
    };
    let res = await fetcher('/self/photo/save', { method: 'POST', body: dataObj });
    if (res?.[0]?.id) {
      const newBlockToSave: Block = {
        i: res[0].id,
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        p_img: dataObj.url,
        cropped_img: dataObj.cropped_url,
        crop_x: crop.x,
        crop_y: crop.y,
        crop_w: crop.width,
        crop_h: crop.height,
      };
      setBlocks((prev) => [
        ...prev,
        newBlockToSave,
      ]);
      savedBlocks.current = [
        ...savedBlocks.current,
        newBlockToSave,
      ];
      setCropBlock({
        i: "",
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        p_img: "",
      });
      toast.success("picture saved!");
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
          const arr = {
            ...block,
            crop_x: crop.x,
            crop_y: crop.y,
            crop_w: crop.width,
            crop_h: crop.height
          };
          updateAndSaveToBE();
          return arr;
        }
        return b;
      });
    });
    toast.success("picture updated!");
  }

  const updateAndSaveToBE = () => {
    fetcher(
      `/self/photo/update/${block.i}`,
      {
        method: 'POST',
        body: {
          url: block.p_img,
          x: block.x,
          y: block.y,
          w: block.w,
          h: block.h,
          crop_x: crop.x,
          crop_y: crop.y,
          crop_w: crop.width,
          crop_h: crop.height,
        }
      }
    )
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 bg-black/80 flex justify-center items-start">
      <div className="pt-8 flex flex-col items-center h-full">
        <h2 className="text-2xl font-bold text-white">Crop Image</h2>
        <div className="flex-1 w-full flex items-center">
          <ReactCrop
            crop={crop}
            ruleOfThirds
            onChange={onCropChange}
            aspect={crop.width/crop.height}
            className="w-2/3 mx-auto"
          >
            <img ref={imageRef} src={block.p_img} alt="img" crossOrigin="anonymous"/>
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