import React, { Dispatch, SetStateAction, useRef } from "react";
import GridLayout, { Layout, WidthProvider } from "react-grid-layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrop, faTrash } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { Block } from "..";
import CropModule from "./CropModule";
import { DeleteImageFromS3 } from "../imgeUpload";
import ControlPanel from "./ControlPanel";
import fetcher from "../../../utils/fetcher";

interface Props {
  albumId: string;
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  isCreator: boolean;
}

const ResponsiveGridLayout = WidthProvider(GridLayout);

const NUM_OF_COLUMNS = 2;
export const ROW_HEIGHT = (typeof window !== "undefined" ? window.innerWidth : 300) / NUM_OF_COLUMNS - 15;

const BentoEditor = ({ albumId, blocks, setBlocks, isCreator }: Props) => {
  const savedBlocks = useRef<Block[]>(blocks);
  const [unsavedChanges, setUnsavedChanges] = React.useState<boolean>(false);
  const [isEditable, setIsEditable] = React.useState<boolean>(true);
  const [cropBlock, setCropBlock] = React.useState<Block>({
    i: "",
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    p_img: ""
  });
  
  const handleCropButtonClick = (block: Block) => {
    setCropBlock(block);
  }

  const hasBlocksChanged = (blocks: Block[]): boolean => {
    return blocks.some((block, index) => {
      return (
        (block?.p_img !== savedBlocks.current[index]?.p_img)
        || (block.x !== savedBlocks.current[index].x)
        || (block.y !== savedBlocks.current[index].y)
        || (block.w !== savedBlocks.current[index].w)
        || (block.h !== savedBlocks.current[index].h)
        || (block?.text !== savedBlocks.current[index]?.text)
      );
    });
  }

  const handleLayoutChange = (layout: Layout[]): void => {
    let blocksArray = [];
    setBlocks(state => {
      blocksArray = layout.map((block, index) => {
        return {
          ...state[index],
          x: block.x,
          y: block.y,
          w: block.w,
          h: block.h,
          crop_x: block.x,
          crop_y: block.y,
          crop_w: block.w * ROW_HEIGHT,
          crop_h: block.h * ROW_HEIGHT,
        };
      });
      return blocksArray;
    });
    if (hasBlocksChanged(blocksArray)) {
      setUnsavedChanges(true);
    }
  };

  const handleDelete = async (block: Block) => {
    if (confirm("Want to delete?")) {
      if (block.p_img) {
        let splitUrl = block.p_img.split('/');
        const filepath_S3 = `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1]}`
        DeleteImageFromS3(
          filepath_S3,
          async () => {
            let res = await fetcher(`/self/photo/delete/${block.i}`, { method: 'POST' });
            if (res?.deleted) {
              setBlocks(state => state.filter(bl => bl.i !== block.i));
              savedBlocks.current = savedBlocks.current.filter(block => block.i !== cropBlock.i);
              toast.success("photo deleted!");
            }
          },
        );
      } else {
        let res = await fetcher(`/self/photo/delete/${block.i}`, { method: 'POST' });
        if (res?.deleted) {
          setBlocks(state => state.filter(bl => bl.i !== block.i));
          savedBlocks.current = savedBlocks.current.filter(block => block.i !== cropBlock.i);
          toast.success("text deleted!");
        }
      }
    }
  }

  const handleTextUpdate = async (e: React.FocusEvent<HTMLDivElement>, block: Block) => {
    const text = e.currentTarget.innerText;
    if (block.text === text) return;
    const ns = [];
    setBlocks(state => {
      console.log(state);
      state.forEach(blo => {
        if (blo.i === block.i) {
          ns.push({ ...blo, text });
        } else {
          ns.push(blo);
        }
      });
      return ns;
    });
    if (hasBlocksChanged(ns)) {
      setUnsavedChanges(true);
    }
  }

  return (
    <div className='relative'>
      <div className="w-screen">
        {/* <h1 className="text-center font-extralight text-2xl pb-10 pt-12 tracking-wider">
          <span className="font-extrabold text-[32px] mr-[1.5px]">
            M
          </span>
          <span className=" text-[20px]">
            idnight mass
          </span>
        </h1> */}
        <ResponsiveGridLayout
          className="layout "
          layout={blocks}
          cols={2}
          draggableCancel="#tile-button"
          rowHeight={ROW_HEIGHT - 5}
          onLayoutChange={handleLayoutChange}
          useCSSTransforms={true}
          isResizable={isCreator && isEditable}
          isDraggable={isCreator && isEditable}
        >
          {blocks.map((block, index) => (
            <div
              key={block.i}
              data-grid={blocks[index]}
              className={`border-[1px] relative ${block.p_img || isEditable ? "border-neutral-200 drop-shadow-sm" : "border-transparent"}`}
            >
              {(block.cropped_img || block.p_img) && (
                <img
                  // TODO: Better cache control
                  src={`${block.cropped_img || block.p_img}?${new Date().getTime()}`}
                  alt="img"
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  id={`img-${block.i}`}
                />
              )}
              {block.text && (
                <div
                  className="absolute top-0 left-0 w-full h-full p-2 text-black text-xl px-4 py-4 leading-snug"
                  contentEditable={isCreator && !isEditable}
                  onBlur={(e) => handleTextUpdate(e, block)}
                  dangerouslySetInnerHTML={{ __html: block.text }}
                />
              )}
              {isCreator && isEditable && (
                <>
                  {!block.text && (
                    <button
                      id="tile-button"
                      className="absolute text-yellow-400 py-[5px] px-[7px] top-1 text-xs right-1 rounded-full bg-black  drop-shadow-sm"
                      onClick={(e) => { e.stopPropagation(); handleCropButtonClick(block); }}
                    >
                      <FontAwesomeIcon icon={faCrop} className="-mb-[0.5px]" />
                    </button>
                  )}
                  <button
                    id="tile-button"
                    className="absolute top-1 left-1 rounded-full bg-red-700  drop-shadow-sm py-[1px] px-[8px]"
                    onClick={() => handleDelete(block)}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="fas fa-check text-[11px] mb-[1.5px] text-white"
                    />
                  </button>
                </>
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
      <ControlPanel
        albumId={albumId}
        isCreator={isCreator}
        unsavedChanges={unsavedChanges}
        savedBlocks={savedBlocks}
        blocks={blocks}
        setBlocks={setBlocks}
        setIsEditable={setIsEditable}
        isEditable={isEditable}
        setCropBlock={setCropBlock}
      />
      {cropBlock.p_img && (
        <CropModule
          savedBlocks={savedBlocks}
          block={cropBlock}
          setCropBlock={setCropBlock}
          setBlocks={setBlocks}
          albumId={albumId}
        />
      )}
    </div>
  );
}

export { BentoEditor };