import Konva from 'konva';
import React, { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast';
import fetcher from '../../../utils/fetcher';
import { UploadImageToS3, DeleteImageFromS3 } from '../imgeUpload';

export default function ImageEditor({
  albumId,
  data,
  isCreator,
  setSlideData,
  order,
  aspectRatio = 9/16,
  saveOverride,
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
      let canvasWidth = parentElement.offsetWidth;
      let canvasHeight = parentElement.offsetWidth * (aspectRatio);

      if (saveOverride) {
        canvasWidth = window.innerWidth * 0.70;
        canvasHeight = window.innerWidth * 0.70 * aspectRatio;
      }

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
        // console.log('click img', uploadRef.current)
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

        var widthRatio = document.getElementById(`slide-container-${data.id}`).offsetHeight / img_height;
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
        if(saveOverride){
          handleSave();
        }
      }
    }
    catch (e) {
      console.log('error', e);
    }
  }
  
  function removeWhitespaces() {
    const imgDimensions = groupRef.current.getClientRect();
    stageRef.current.width(imgDimensions.width);
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
    // if (saveOverride) {
    //   const url = `https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/${epoch}`;
    //   saveOverride(url);
    //   stageRef.current.destroy();
    //   setSlideData(
    //     state => state.map(el => el.id === data.id ? {...el, url } : el ),
    //   )
    // } else {
    const dataObj = {
      type: data.type,
      url: `https://s3.ap-south-1.amazonaws.com/picorie-assets/${epoch}`,
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
    // }
  }

  const handleSave = async () => {
    transformerRef.current.nodes([]);
    addToLayerAndRedraw(transformerRef.current);
    // const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    const dataURL = stageRef.current.toDataURL();
    const epoch = `_uploads_/${Date.now()}.jpeg`;
    if (saveOverride) {
      saveOverride(dataURL, epoch);
      stageRef.current.destroy();
    } else {
      UploadImageToS3(
        dataURL,
        epoch,
        () => saveToBE(epoch),
      );
    }
  };

  const handleDelete = async () => {
    if (confirm("Want to delete?")) {
      let splitUrl = data.url.split('/');
      splitUrl = `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1]}`
      DeleteImageFromS3(
        splitUrl,
        async () => {
          let res = await fetcher(`/self/photo/delete/${data.id}`, { method: 'POST' });
          if (res?.deleted) {
            setSlideData(
              state => state.filter(el => el.id !== data.id),
            )
            toast.success("photo deleted!");
          }
        },
      );
    }
  };

  return (
    <>
      <style jsx>
        {`
          .wrapper {
            pointer-events: ${isSaved ? 'none' : 'auto'};
            transition: all 0.2s ease-in-out;
            margin: 60px 0;
            height: 90vh;
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
            padding: 16px;
            display: flex;
            justify-content: end;
            left: 0;
            right: 0;
            z-index: 2;
            top: -60.5px;
          }
          .controls.last {
            top: auto;
            bottom: -60.5px;
          }
          .slide-container {
            box-shadow: 0px 0px 2px 0px rgba(0,0,0,0.15);
            max-height: calc( 100% * ${aspectRatio} );
          }
        `}
      </style>
      <div className='wrapper'>
        {isCreator && (
          <div className={`controls ${isSaved && 'opacity-0'} absolute`}>
            <button className={`minimal-btn ${(saveOverride) && 'display-none'} `} onClick={resetHandler}>
              &#x21BA; reset
            </button>
            <button className='minimal-btn' onClick={removeWhitespaces}>
              remove whitespaces
            </button>
          </div>
        )}
        <article id={`slide-container-${data?.id}`} className={`slide-container ${isSaved && 'saved'} d-flex justify-center`}>
          {isSaved && (
            <img src={data?.url} height={"100%"} />
          )}
        </article>
        {isCreator && (
          <div className={`controls last ${(saveOverride) && 'opacity-0'} absolute`}>
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
