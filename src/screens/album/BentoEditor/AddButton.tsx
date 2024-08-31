import { Dispatch, SetStateAction, useRef } from "react";
import { Block } from "..";

type Props = {
  setBlocks: Dispatch<SetStateAction<Block[]>>;
}

const AddButton = ({ setBlocks }: Props) => {
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
        }
      });
      reader.readAsDataURL(inputElement.files[0]);
    }
  }

  const createNewBlock = (img_src: string) => {
    setBlocks((prev) => [
      ...prev,
      { i: Date.now().toString(), x: 0, y: 0, w: 1, h: 1, p_img: img_src },
    ]);
  }

  return (
    <div className="fixed bottom-0 left-0 w-full p-2">
      <button onClick={handleCreateButton} className='w-full bg-gray-300 shadow py-2'>+ Add</button>
      <input ref={inputRef} type='file' hidden onChange={onSelectFile} />
    </div>
  );
};

export default AddButton;