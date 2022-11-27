const isDesktopWindow = () => window.innerWidth > 992;

export const BORDER_WIDTH = 7;
const screenWidthCorrectedMOB = window.innerWidth - 32;
export const CANVAS_WIDTH = isDesktopWindow() ? 1000 : (1000/562 * screenWidthCorrectedMOB);
export const CANVAS_HEIGHT = isDesktopWindow() ? 562 : screenWidthCorrectedMOB;
export const NEW_SLIDE_ID = "#";
export const COLLAGE_CONFIG = {
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