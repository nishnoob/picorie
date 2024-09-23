import { Crop } from 'react-image-crop'
import { Block } from '..';

export async function canvasPreview(
  image: HTMLImageElement,
  block: Block,
  canvas: HTMLCanvasElement,
  crop: Crop,
  scale = 1,
  rotate = 0,
  rowHeight: number,
) {
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  canvas.width = rowHeight * block.w;
  canvas.height = rowHeight * block.h;
  const pixelRatio = window.devicePixelRatio

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  ctx.save()
  ctx.drawImage(
    image,
    crop.x ,
    crop.y ,
    (crop.x ) + (crop.width ),
    (crop.y ) + (crop.height ),
    0,
    0,
    canvas.width,
    canvas.height,
  )
  ctx.restore()
}
