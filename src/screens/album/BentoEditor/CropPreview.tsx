import { useEffect, useRef } from 'react';
import { canvasPreview } from './CanvasPreview';
import { Crop } from 'react-image-crop';

export default function CropPreview({ img, crop, rowHeight }: {img: string, crop: Crop, rowHeight: number}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!crop?.width || !crop?.height || !img || !canvasRef.current) {
            return;
        }

        loadCanvasPreview(img, crop, 1, 0);
    }, [img, crop]);

    const loadCanvasPreview = async (img: string, crop: Crop, scale?: number, rotate?: number) => {
        // const image = document.getElementById(id) as HTMLImageElement;
        const image = await convertURLtoHTMLImageElement(img);
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        canvasPreview(image, canvas, crop, scale, rotate, rowHeight);
    }

    const convertURLtoHTMLImageElement = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    }

    if (!!crop && !!img) {
        return <canvas ref={canvasRef} />;
    }
}