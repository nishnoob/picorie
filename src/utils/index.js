export const isServer = () => typeof window === "undefined";

export const isDesktopWindow = () => isServer() ? true : window.innerWidth > 992;

export const BORDER_WIDTH = 7;
const screenWidthCorrectedMOB = isServer() ? 0 : (window.innerWidth - 32);
export const CANVAS_WIDTH = (isDesktopWindow() || isServer()) ? 1000 : (1000/562 * screenWidthCorrectedMOB);
export const CANVAS_HEIGHT = (isDesktopWindow() || isServer()) ? 562 : screenWidthCorrectedMOB;
export const NEW_SLIDE_ID = "#";



export const COLLAGE_CONFIG = {
  0: {
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: 200,
  },
  1: {
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    frames: [
      {
        name: 'pic1',
        x: 0,
        y: 0,
        frameWidth: CANVAS_WIDTH,
      },
    ]
  },
  2: {
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    frames: [
      {
        name: 'pic1',
        x: 0,
        y: 0,
        frameWidth: CANVAS_WIDTH / 3,
      },
      {
        name: 'pic2',
        x: CANVAS_WIDTH / 3,
        y: 0,
        frameWidth: CANVAS_WIDTH / 3,
      },
      {
        name: 'pic3',
        x: (CANVAS_WIDTH / 3) * 2,
        y: 0,
        frameWidth: CANVAS_WIDTH / 3,
      },
    ]
  },
};

export const epochToS3URL = epoch => `https://s3.ap-south-1.amazonaws.com/album-hosting.amirickbolchi.com/${epoch}`;