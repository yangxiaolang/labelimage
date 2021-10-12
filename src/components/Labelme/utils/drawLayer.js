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
  if (mode === "poly") {
    drawLayer.pathPoints = [];
    drawLayer.on("mousemove", drawTempPath);
    drawLayer.on("mousemove", polygonCountIsClose);
    drawLayer.on("click", drawPolyPathHandler);
  }
  return drawLayer;
};

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
    board.followCircle.on("mousemove", drawTempRect.bind(board));
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

function drawTempPath(e) {
  if (this.pathPoints.length > 0) {
    const [x, y] = currentNodeMovePosition(e, this.root().zoomNum);
    // const lastNode = this.pathPoints[this.pathPoints.length - 1];
    const tempPathArray = this.polyPath.array();
    tempPathArray[this.pathPoints.length] = ["L", x, y];
    if (!this.tempPath) {
      this.path().plot();
      this.tempPath = this.path()
        .plot(tempPathArray.join().replaceAll(",", " "))
        .attr({
          stroke: this.followColor,
          fill: this.followColor,
          "fill-opacity": 0.6,
          "stroke-width": 3,
          "stroke-dasharray": "10,10",
        })
        .on("mousemove", mouseMoveFollow);
    } else {
      this.tempPath.plot(tempPathArray.join().replaceAll(",", " "));
    }
  }
}

function drawPolyPathHandler(e) {
  const [x, y] = currentNodeMovePosition(e, this.root().zoomNum);
  if (this.pathPoints.length === 0) {
    this.pathPoints.push(
      this.circle()
        .radius(6)
        .attr({ cx: x, cy: y, fill: this.followColor, id: "begin" })
    );
    this.polyPath = this.path()
      .plot(["M", x, y].join().replaceAll(",", " "))
      .attr({
        stroke: this.followColor,
        fill: "none",
        "stroke-width": 3,
      });
  } else {
    this.pathPoints.push(
      this.circle()
        .radius(6)
        .attr({ cx: x, cy: y, fill: this.followColor })
    );
    const pathArray = this.polyPath.array();
    pathArray.push(["L", x, y]);
    this.polyPath.plot(pathArray.join().replaceAll(",", " "));
  }
}

function drawRectHandler(e) {
  const [x, y] = currentNodeMovePosition(e, this.root().zoomNum);
  if (!this.begin) {
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
        name: "untitled",
        type: "rectangle",
        color: this.followColor,
      })
      .on("click", createMask)
      .addTo("#canvas");
    this.parent().drawDone(rect);
  }
}

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

function polygonCountIsClose(e) {
  if (this.pathPoints.length > 2) {
    const [x, y] = currentNodeMovePosition(e, this.root().zoomNum);
    const { cx, cy } = this.pathPoints[0].attr(["cx", "cy"]);
    const a = Math.abs(cx - x);
    const b = Math.abs(cy - y);
    if (Math.sqrt(a * a + b * b) < 15) {
      if (!this.closePoint) {
        this.closePoint = this.circle()
          .radius(15)
          .attr({
            cx,
            cy,
            fill: this.followColor,
            "fill-opacity": 0.5,
          })
          .on("click", function(e) {
            pathToPolygon.call(this.parent());
            e.stopPropagation();
          });
      }
      this.followCircle.hide();
      this.closePoint.show();
      const tempPathArray = this.polyPath.array();
      tempPathArray[this.pathPoints.length] = ["L", cx, cy];
      this.tempPath.plot(tempPathArray.join().replaceAll(",", " "));
    } else {
      if (this.closePoint) {
        this.closePoint.remove();
        this.closePoint = null;
      }
      this.followCircle.show();
    }
  }
}

function pathToPolygon() {
  const { cx, cy } = this.pathPoints[0].attr(["cx", "cy"]);
  const tempPathArray = this.polyPath.array();
  tempPathArray[this.pathPoints.length] = ["L", cx, cy];
  const polygon = this.polyPath
    .plot(tempPathArray.join().replaceAll(",", " "))
    .toPoly()
    .attr({
      stroke: this.followColor,
      "stroke-width": 3,
      fill: "black",
      "fill-opacity": 0,
      name: "untitled",
      type: "polygon",
      color: this.followColor,
    })
    .on("click", createMask)
    .addTo("#canvas");
  this.parent().drawDone(polygon);
}
