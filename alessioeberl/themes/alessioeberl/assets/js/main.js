var FluidGrid = require('@chickenservice/fluidgrid/');

let config = {"elementId": "content", "childSelector": ".teaser", "maxHeight": 320, "gutter": 5};
let grid = new FluidGrid(config);

window.addEventListener("load", () => grid.update(), false);
window.addEventListener("resize", () => grid.update(), false);
UIkit.util.on("#content", "afterFilter", () => { grid.update();});