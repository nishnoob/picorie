import { Crop } from 'react-image-crop'

const TO_RADIANS = Math.PI / 180

export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: Crop,
  scale = 1,
  rotate = 0,
  rowHeight: number,
) {
  console.log(crop)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  canvas.width = rowHeight;
  canvas.height = rowHeight;
  const scaleX = canvas.width / image.width;
  const scaleY = canvas.height / image.height;
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio
  // const pixelRatio = 1

  // canvas.width = rowHeight;
  // canvas.height = rowHeight;

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  // const cropX = crop.x * scaleX
  // const cropY = crop.y * scaleY

  // const rotateRads = rotate * TO_RADIANS
  // const centerX = image.naturalWidth / 2
  // const centerY = image.naturalHeight / 2

  ctx.save()

  // 5) Move the crop origin to the canvas origin (0,0)
  // ctx.translate(-cropX, -cropY)
  // 4) Move the origin to the center of the original position
  // ctx.translate(centerX, centerY)
  // 3) Rotate around the origin
  // ctx.rotate(rotateRads)
  // 2) Scale the image
  // ctx.scale(scale, scale)
  // 1) Move the center of the image to the origin (0,0)
  // ctx.translate(-centerX, -centerY)
//   var hRatio = canvas.width / image.width    ;
// var vRatio = canvas.height / image.height  ;
// var ratio  = Math.max ( hRatio, vRatio );
const scaleFactor = canvas.width / image.width;
  var longerEdge = Math.max(image.naturalWidth, image.naturalHeight);
  ctx.drawImage(
    image,
    crop.x / scaleX,
    crop.y / scaleY,
    crop.height / scaleX,
    crop.width / scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  )
// debugger
  ctx.restore()
}
