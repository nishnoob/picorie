
export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 562;
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