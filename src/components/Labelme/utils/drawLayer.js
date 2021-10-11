import { currentNodeMovePosition, randomColor } from "./utils";
import { createMask } from "./Mask";

export const createDrawLayer = function(mode) {
  const { x, y, width, height } = this.labelImage.attr([
    "x",
    "y",
    "width",
    "height",
  ]);
  const drawLayer = this.group().attr({ id: "drawLayer", width, height });
  drawLayer.followColor = randomColor();
  drawLayer.mode = mode;
  drawLayer
    .rect(width, height)
    .attr({ x, y, "fill-opacity": 0 })
    .on("mousemove", mouseMoveFollow);

  if (mode === "rect") {
    drawLayer.on("mousemove", drawTempRect);
    drawLayer.on("click", drawRectHandler);
  }
  return drawLayer;
};

function drawTempRect(e) {
  if (this.begin) {
    const [x, y] = currentNodeMovePosition(e, this.root().zoomNum);
    const { cx, cy } = this.begin.attr(["cx", "cy"]);
    if (!this.tempRect) {
      this.tempRect = this.rect(Math.abs(x - cx), Math.abs(y - cy)).attr({
        x: Math.min(x, cx),
        y: Math.min(y, cy),
        stroke: this.followColor,
        "stroke-dasharray": "10,10",
        "stroke-width": 3,
        fill: "none",
      });
    } else {
      this.tempRect.attr({
        width: Math.abs(x - cx),
        height: Math.abs(y - cy),
        x: Math.min(x, cx),
        y: Math.min(y, cy),
      });
    }
  }
}

function mouseMoveFollow(e) {
  const [cx, cy] = currentNodeMovePosition(e, this.root().zoomNum);
  const board = this.parent();
  this.root().on("mousemove", removeFollower.bind(this));
  if (!board.followCircle) {
    board.followCircle = board
      .circle()
      .radius(6)
      .attr({ cx, cy, fill: board.followColor })
      .on("mousemove", function(e) {
        const [x, y] = currentNodeMovePosition(e, this.root().zoomNum);
        this.attr({ cx: x, cy: y });
      })
      .on("mousemove", drawTempRect.bind(board));
  } else {
    board.followCircle.attr({ cx, cy });
  }
  if (board.mode === "rect") {
    board.followCircle
      .on("mousemove", drawTempRect.bind(board))
  }
}

function removeFollower(e) {
  const board = this.parent();
  const [cx, cy] = currentNodeMovePosition(e, this.root().zoomNum);
  const { width, height } = board.attr(["width", "height"]);
  if (cx > width || cy > height || cx < 0 || cy < 0) {
    if (board.followCircle) {
      board.followCircle.remove();
      board.followCircle = null;
      this.root().off("mousemove");
    }
  }
}

function drawRectHandler(e) {
  const [x, y] = currentNodeMovePosition(e, this.root().zoomNum);
  if (!this.begin) {
      console.log(this)
    this.begin = this.circle()
      .radius(6)
      .attr({ cx: x, cy: y, fill: this.followColor, id: "begin" });
  } else {
    const { cx, cy } = this.begin.attr(["cx", "cy"]);
    const rect = this.rect(Math.abs(x - cx), Math.abs(y - cy))
      .attr({
        x: Math.min(x, cx),
        y: Math.min(y, cy),
        stroke: this.followColor,
        "stroke-width": 3,
        "fill-opacity": 0,
        name: 'untitled',
        type: 'rectangle',
        color:this.followColor
      }).on('click',createMask)
      .addTo("#canvas");
    this.parent().drawDone(rect);
  }
}
