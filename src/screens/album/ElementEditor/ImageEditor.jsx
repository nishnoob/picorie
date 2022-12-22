import Konva from 'konva';
import React, { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast';
import fetcher from '../../../utils/fetcher';
import UploadImageToS3 from '../imgeUpload';

export default function ImageEditor({
  albumId,
  data,
  isCreator,
  setSlideData,
  order,
}) {
  const isSaved =  Boolean(data?.url);
  const stageRef = useRef();
  const layerRef = useRef();
  const groupRef = useRef();
  const transformerRef = useRef();
  const uploadRef = useRef();

  useEffect(() => {
    if (!data?.url) {
      init();
    }
  }, []);

  const init = () => {
    const parentElement = document.getElementById(`slide-container-${data.id}`);
    if (parentElement && !isSaved) {
      const canvasWidth = parentElement.offsetWidth;
      const canvasHeight = parentElement.offsetWidth * (9/16);

      stageRef.current = new Konva.Stage({
        container: `slide-container-${data.id}`,
        width: canvasWidth,
        height: canvasHeight,
      });
      layerRef.current = new Konva.Layer();
      groupRef.current = new Konva.Group({
        clip: {
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
        },
      });
      const bgRectangle = new Konva.Rect({
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        fill: 'white',
      });

      bgRectangle.on('click', () => {
        uploadRef.current.click();
      })
      addCursorStyle(bgRectangle, 'pointer');
      groupRef.current.add(bgRectangle);
      
      const textVar = new Konva.Text({
        text: 'Click to upload',
        x: canvasWidth / 2 - 70,
        y: canvasHeight / 2,
        fontSize: 20,
      });
      groupRef.current.add(textVar);
      layerRef.current.add(groupRef.current);

      transformerRef.current = new Konva.Transformer({
        nodes: [],
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      });
      layerRef.current.add(transformerRef.current);
      stageRef.current.add(layerRef.current);
    }
  };

  const addImage = (file) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      let img1 = null
      img.onload = () => {
        var img_width = img.width;
        var img_height = img.height;

        var widthRatio = document.getElementById(`slide-container-${data.id}`).offsetWidth / img_width;
        var newWidth = img_width * widthRatio,
            newHeight = img_height * widthRatio
        img1 = new Konva.Image({
          x: 0,
          y: 0,
          image: img,
          width: newWidth,
          height: newHeight,
          draggable: true,
        })
        addCursorStyle(img1, 'move');
        img1.on('mousedown', () => {
          transformerRef.current.nodes([img1]);
          addToLayerAndRedraw(transformerRef.current, groupRef.current);
        })
        groupRef.current.destroyChildren();
        transformerRef.current.nodes([img1]);
        groupRef.current.add(img1);
        addToLayerAndRedraw(transformerRef.current, groupRef.current);
      }
    }
    catch (e) {
      console.log('error', e);
    }
  }

  const addCursorStyle = (node, cursorStyle = 'pointer') => {
    node.on('mouseenter', () => {
      stageRef.current.container().style.cursor = cursorStyle;
    });

    node.on('mouseleave', () => {
      stageRef.current.container().style.cursor = 'default';
    });
  };

  const addToLayerAndRedraw = (elements) => {
    layerRef.current.add(elements);
    stageRef.current.add(layerRef.current);
  }

  const resetHandler = () => setSlideData(
    state => state.map(el =>
      el.id === data.id ?
        { id: el.id, type: null }
        : el
    ));

  const saveToBE = async (epoch) => {
    const dataObj = {
      type: data.type,
      url: `https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/${epoch}`,
      album_id: [albumId],
      order,
    };
    let res = await fetcher('/self/photo/save', { method: 'POST', body: dataObj });
    if (res?.[0]?.id) {
      stageRef.current.destroy();
      setSlideData(
        state => state.map(el => el.id === data.id ? res?.[0] : el ),
      )
      toast.success("picture saved!");
    }
  }

  const handleSave = async () => {
    transformerRef.current.nodes([]);
    addToLayerAndRedraw(transformerRef.current);
    // const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const dataURL = stageRef.current.toDataURL();
    const epoch = `_uploads_/${Date.now()}.jpeg`;
    UploadImageToS3(
      dataURL,
      epoch,
      () => saveToBE(epoch),
    );
  };

  const handleDelete = async () => {
    if (confirm("Want to delete?")) {
        let res = await fetcher(`/self/photo/delete/${data.id}`, { method: 'POST' });
        if (res?.deleted) {
          setSlideData(
            state => state.filter(el => el.id !== data.id),
          )
          toast.success("photo deleted!");
        }
    }
  };

  return (
    <>
      <style jsx>
        {`
          .wrapper {
            pointer-events: ${isSaved ? 'none' : 'auto'};
            transition: all 0.2s ease-in-out;
          }
          .wrapper:hover {
            background-color: ${isSaved ? 'lightgrey' : 'none'};
          }
          article {
            transition: all 0.2s ease-in-out;
          }
          .wrapper:hover article.saved {
            transform: scale(0.96);
          }
          .wrapper :global(.minimal-btn.danger) {
            pointer-events: auto;
          }
          .controls {
            padding: 16px 0;
            display: flex;
            justify-content: end;
          }
          .slide-container {
            box-shadow: 0px 0px 2px 0px rgba(0,0,0,0.15);
            height: 100%;
            width: 100%;
          }
        `}
      </style>
      <div className='wrapper'>
        <div className={`controls ${isSaved && 'opacity-0'}`}>
          <button className='minimal-btn' onClick={resetHandler}>
            &#x21BA; reset
          </button>
        </div>
        <article id={`slide-container-${data?.id}`} className={`slide-container ${isSaved && 'saved'}`}>
          {isSaved && (
            <img src={data?.url} width={"100%"} height={"100%"} />
          )}
        </article>
        {isCreator && (
          <div className='controls'>
            {isSaved ? (
              <button
                className='minimal-btn danger'
                onClick={handleDelete}
              >
                delete
              </button>
            ) : (
              <button
                className='minimal-btn'
                onClick={handleSave}
                disabled={isSaved}
              >
                save
              </button>
            )}
          </div>
        )}
        <input
          className='opacity-0'
          type="file"
          ref={uploadRef}
          onChange={(e) => addImage(e.target.files[0])}
        />
      </div>
    </>
  )
}
