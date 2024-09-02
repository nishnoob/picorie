import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import GridLayout, { Layout, WidthProvider } from "react-grid-layout";
import AddButton from "./AddButton";
import { Block } from "..";
import CropModule from "./CropModule";

const ResponsiveGridLayout = WidthProvider(GridLayout);

interface Props {
  albumId: string;
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  isCreator: boolean;
}

const BentoEditor = ({ albumId, blocks, setBlocks, isCreator }: Props) => {
  const savedBlocks = useRef<Block[]>([]);
  const [cropBlock, setCropBlock] = React.useState<Block>({
    i: "",
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    p_img: ""
  });
  const [unsavedChanges, setUnsavedChanges] = React.useState<boolean>(false);

  const numberOfCols = 2;

  const rowHeight = window.innerWidth / numberOfCols - 15;


  useEffect(() => {
    savedBlocks.current = blocks;
  }, []);

  const onSelectCropFile = (block: Block) => {
    setCropBlock(block);
  }

  const hasBlocksChanged = (blocks: Block[]): boolean => {
    console.log(blocks, savedBlocks.current);
    return blocks.some((block, index) => {
      return (
        (block?.p_img !== savedBlocks.current[index]?.p_img)
        || (block.x !== savedBlocks.current[index].x)
        || (block.y !== savedBlocks.current[index].y)
        || (block.w !== savedBlocks.current[index].w)
        || (block.h !== savedBlocks.current[index].h)
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
          h: block.h
        };
      });
      return blocksArray;
    });
    if (hasBlocksChanged(blocksArray)) {
      setUnsavedChanges(true);
    }
  };

  return (
    <div className=' relative'>
      <div className="w-screen">
        <ResponsiveGridLayout
          className="layout "
          layout={blocks}
          cols={2}
          draggableCancel="#crop-button"
          rowHeight={rowHeight - 5}
          onLayoutChange={handleLayoutChange}
          isDraggable={isCreator}
          isResizable={isCreator}
        >
          {blocks.map((block, index) => (
            <div key={block.i} data-grid={blocks[index]} className="border border-gray-300 drop-shadow-sm rounded overflow-clip relative">
              {block.p_img && (<img src={block.p_img} alt="img" />)}
              {isCreator && (
                <div
                  id="crop-button"
                  className="cancelSelectorName absolute top-1 right-1 border rounded-full bg-white p-1"
                  onClick={(e) => { e.stopPropagation(); onSelectCropFile(block); }}
                >
                  <CropIcons />
                  {/* <i className="fa-solid fa-crop"></i> */}
                </div>
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
      {isCreator && (
        <AddButton
          albumId={albumId}
          setBlocks={setBlocks}
          unsavedChanges={unsavedChanges}
          savedBlocks={savedBlocks}
          blocks={blocks}
        />
      )}
      {cropBlock.p_img && (
        <CropModule
          block={cropBlock}
          setCropBlock={setCropBlock}
          setBlocks={setBlocks}
          rowHeight={rowHeight}
        />
      )}
    </div>
  );
}

const CropIcons = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-crop" viewBox="0 0 16 16">
    <path d="M3.5.5A.5.5 0 0 1 4 1v13h13a.5.5 0 0 1 0 1h-2v2a.5.5 0 0 1-1 0v-2H3.5a.5.5 0 0 1-.5-.5V4H1a.5.5 0 0 1 0-1h2V1a.5.5 0 0 1 .5-.5m2.5 3a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4H6.5a.5.5 0 0 1-.5-.5"/>
  </svg>
);

export { BentoEditor };