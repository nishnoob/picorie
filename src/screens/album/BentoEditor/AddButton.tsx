import { Dispatch, MutableRefObject, SetStateAction, useRef } from "react";
import { Block } from "..";
import { UploadImageToS3 } from "../imgeUpload";
import fetcher from "../../../utils/fetcher";

type Props = {
  albumId: string;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  unsavedChanges: boolean;
  savedBlocks: MutableRefObject<Block[]>;
}

const AddButton = ({ albumId, setBlocks, unsavedChanges, savedBlocks }: Props) => {
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

  const updateAllImagesPosition = async () => {
    // for (let i = 0; i < savedBlocks.current.length; i++) {
    //   const block = savedBlocks.current[i];
    //   if (block.p_img.includes('https
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
      </div>
    </div>
  );
};

export default AddButton;