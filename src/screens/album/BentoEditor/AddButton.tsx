import { Dispatch, MutableRefObject, SetStateAction, useRef, useState } from "react";
import { Block } from "..";
import { UploadImageToS3 } from "../imgeUpload";
import fetcher from "../../../utils/fetcher";

type Props = {
  albumId: string;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  unsavedChanges: boolean;
  savedBlocks: MutableRefObject<Block[]>;
  blocks: Block[];
  setIsEditable: Dispatch<SetStateAction<boolean>>;
  isEditable: boolean;
}

const AddButton = ({ albumId, setBlocks, unsavedChanges, savedBlocks, blocks, setIsEditable, isEditable }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCreateButton(e: React.MouseEvent) {
    e.preventDefault();
    if (!inputRef || !inputRef.current) return;
    inputRef.current.click();
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const inputElement = e.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        // this.setState({ src: reader.result })
        if (reader.result && typeof reader.result === 'string') {
          createNewBlock(reader.result)
          inputElement.value = null;
        }
      });
      reader.readAsDataURL(inputElement.files[0]);
    }
  }

  const createNewBlock = (img_src: string) => {
    const epoch = `_uploads_/${Date.now()}.jpeg`;
    UploadImageToS3(
      img_src,
      epoch,
      () => saveToBE(epoch, img_src),
    );
  }

  const saveToBE = async (epoch, img) => {
    const dataObj = {
      url: `https://s3.ap-south-1.amazonaws.com/picorie-assets/${epoch}`,
      album_id: [albumId],
      x: 0,
      y: 0,
      h: 1,
      w: 1,
    };
    let res = await fetcher('/self/photo/save', { method: 'POST', body: dataObj });
    if (res?.[0]?.id) {
      setBlocks((prev) => [
        ...prev,
        { i: Date.now().toString(), x: 0, y: 0, w: 1, h: 1, p_img: img },
      ]);
      savedBlocks.current = [
        ...savedBlocks.current,
        { i: Date.now().toString(), x: 0, y: 0, w: 1, h: 1, p_img: img },
      ];
      // toast.success("picture saved!");
    }
  }

  const returnChangedBlocks = (): Block[] => {
    // compare savedBlocks and blocks
    const blocksToUpdate:Block[] = [];
    savedBlocks.current.forEach(el => {
      const stateBlock = blocks.find(block => block.i === el.i);
      if (stateBlock.i) {
        if (JSON.stringify(el) !== JSON.stringify(stateBlock)) {
          blocksToUpdate.push(stateBlock);
        }
      }
    });
    return blocksToUpdate;
  };

  const updateAllImagesPosition = async () => {
    const updateFetchesArray = [];
    const blocksToUpdate = returnChangedBlocks();
    blocksToUpdate.map((block, index) => {
      // TODO: too many fetches
      updateFetchesArray.push(
        fetcher(
          `/self/photo/update/${block.i}`,
          {
            method: 'POST',
            body: {
              url: block.p_img,
              x: block.x,
              y: block.y,
              w: block.w,
              h: block.h
            }
          }
        )
      );
    });
    await Promise.all(updateFetchesArray);
  }

  const handleEditable = (checked: boolean) => {
    setIsEditable(checked);
  }

  return (
    <div className="fixed bottom-0 left-0 w-full px-4 pb-4">
      <div className="flex w-min justify-center bg-white drop-shadow-sm p-2 gap-2 mx-auto">
        <div className="">
          <button onClick={handleCreateButton} className='h-min border-[2px] bg-transparent border-black border-dashed font-bold px-4 py-1 text-sm'>add</button>
          <input ref={inputRef} type='file' hidden onChange={onSelectFile} />
        </div>
        <div>
          {unsavedChanges && <button onClick={updateAllImagesPosition} className='text-sm bg-black text-white px-4 py-1 border-[3px]  border-black font-bold'>save</button>}
        </div>
        <div>
          <ToggleSwitch isChecked={isEditable} onUpdate={handleEditable} />
        </div>
      </div>
    </div>
  );
};

const ToggleSwitch = ({isChecked, onUpdate}) => {
  const [checked, setChecked] = useState<boolean>(isChecked);
  return (
    <div className="inline-flex items-center">
      <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
        <input id="switch-component" type="checkbox"
          className="absolute w-8 h-4 transition-colors duration-300 rounded-full appearance-none cursor-pointer peer bg-blue-gray-100 checked:bg-gray-900 peer-checked:border-gray-900 peer-checked:before:bg-gray-900"
          checked={checked}
          onChange={(e) => {setChecked(e.target.checked); onUpdate(e.target.checked);}}
        />
        <label htmlFor="switch-component"
          className="before:content[''] absolute top-2/4 -left-1 h-5 w-5 -translate-y-2/4 cursor-pointer rounded-full border border-blue-gray-100 bg-white shadow-md transition-all duration-300 before:absolute before:top-2/4 before:left-2/4 before:block before:h-10 before:w-10 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 peer-checked:translate-x-full peer-checked:border-gray-900 peer-checked:before:bg-gray-900">
          <div className="inline-block p-5 rounded-full top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4"
            data-ripple-dark="true"></div>
        </label>
      </div>
    </div>
  );
};

export default AddButton;