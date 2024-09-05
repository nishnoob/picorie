import { Dispatch, MouseEventHandler, MutableRefObject, SetStateAction, useRef, useState } from "react";
import { Block } from "..";
import fetcher from "../../../utils/fetcher";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

type Props = {
  unsavedChanges: boolean;
  savedBlocks: MutableRefObject<Block[]>;
  blocks: Block[];
  setIsEditable: Dispatch<SetStateAction<boolean>>;
  isEditable: boolean;
  setCropBlock: Dispatch<SetStateAction<Block>>;
  albumId: string;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  isCreator: boolean;
}

const AddButton = ({
  unsavedChanges,
  savedBlocks,
  blocks,
  setIsEditable,
  isEditable,
  setCropBlock,
  albumId,
  setBlocks,
  isCreator
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
    // const epoch = `_uploads_/${Date.now()}.jpeg`;
    // UploadImageToS3(
    //   img_src,
    //   epoch,
    //   () => saveToBE(epoch, img_src),
    // );
    saveToCropBlock(img_src);
  }

  const saveToCropBlock = (img_src: string) => {
    setCropBlock({
      i: Date.now().toString(),
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      p_img: img_src,
    });
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

  const updateUnsavedChanges = async () => {
    const updateFetchesArray = [];
    const blocksToUpdate = returnChangedBlocks();
    blocksToUpdate.map((block, index) => {
      // TODO: too many fetches
      let retObj: any = {
        url: block.p_img,
        x: block.x,
        y: block.y,
        w: block.w,
        h: block.h,
      }
      if (block.text) {
        retObj = {
          ...retObj,
          text: block.text
        }
      }
      const res = updateFetchesArray.push(
        fetcher(
          `/self/photo/update/${block.i}`,
          {
            method: 'POST',
            body: retObj
          }
        )
      );
    });
    const allRes = await Promise.all(updateFetchesArray);
    if (allRes.length === blocksToUpdate.length) {
      savedBlocks.current = blocks;
      toast.success('Changes saved!');
    }
  }

  const handleEditable = (checked: boolean) => {
    setIsEditable(checked);
  }

  const createTextBlock: MouseEventHandler<HTMLButtonElement> = async () => {
    const dataObj = {
      album_id: [albumId],
      x: 0,
      y: 0,
      h: 1,
      w: 1,
      text: "text goes here"
    };
    let res = await fetcher('/self/photo/save', { method: 'POST', body: dataObj });
    if (res?.[0]?.id) {
      const newBlockToSave: Block = {
        i: res[0].id,
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        text: "text goes here"
      };
      setBlocks((prev) => [
        ...prev,
        newBlockToSave,
      ]);
      savedBlocks.current = [
        ...savedBlocks.current,
        newBlockToSave,
      ];
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      if (unsavedChanges) {
        toast.error('Please save your changes before leaving');
      } else {
        router.back();
      }
    } else {
      router.push('/');
    }
  }

  return (
    <div className="fixed flex bottom-0 left-0 w-full px-2 pb-2 items-center">
      <button onClick={handleBack} className="bg-black text-white py-3 px-4 drop-shadow-md">
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      {isCreator && (
        <div className="flex w-min justify-center bg-yellow-500 shadow-sm p-2 gap-2">
          {isEditable && (
            <div className="">
              <button
                onClick={handleCreateButton}
                className='h-min border-[2px] bg-transparent border-black font-bold px-2 py-1 text-sm whitespace-nowrap'
              >
                + pic
              </button>
              <input ref={inputRef} type='file' hidden onChange={onSelectFile} />
            </div>
          )}
          {isEditable && (
            <div className="">
              <button
                onClick={createTextBlock}
                className='h-min border-[2px] bg-transparent border-black font-bold px-2 py-1 text-sm whitespace-nowrap'
              >
                + txt
              </button>
            </div>
          )}
          {unsavedChanges && (
            <div>
              <button
                onClick={updateUnsavedChanges}
                className='text-sm bg-black text-white px-4 py-1 border-[2px] border-black font-bold'
              >
                save
              </button>
            </div>
          )}
          <div className="flex border-2 border-black border-dashed px-2 py-1 items-center gap-2">
            <div className="font-bold text-sm">edit</div>
            <ToggleSwitch isChecked={isEditable} onUpdate={handleEditable} />
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleSwitch = ({isChecked, onUpdate}) => {
  const [checked, setChecked] = useState<boolean>(isChecked);
  return (
    <div className="inline-flex items-center">
      <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
        <input id="switch-component" type="checkbox"
          className=" w-8 h-4 transition-colors duration-300 rounded-full appearance-none cursor-pointer peer bg-blue-gray-100 checked:bg-gray-900 peer-checked:border-gray-900 peer-checked:before:bg-gray-900"
          checked={checked}
          onChange={(e) => {setChecked(e.target.checked); onUpdate(e.target.checked);}}
        />
        <label
          htmlFor="switch-component"
          className="before:content[''] absolute top-2/4 -left-1 h-5 w-5 -translate-y-2/4 cursor-pointer rounded-full border border-blue-gray-100 bg-white shadow-md transition-all duration-300 before:absolute before:top-2/4 before:left-2/4 before:block before:h-10 before:w-10 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity hover:before:opacity-10 peer-checked:translate-x-full peer-checked:border-gray-900 peer-checked:before:bg-gray-900"
        >
          <div
            className="inline-block p-5 rounded-full top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4"
            data-ripple-dark="true"
          >
          </div>
        </label>
      </div>
    </div>
  );
};

export default AddButton;