import './index.css'

export const parameters = {
  layout: 'fullscreen',
}

export const decorators = [(story) => `<canvas id="canvas-root"></canvas>${story()}`]
