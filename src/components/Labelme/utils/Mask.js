import { randomColor } from "./utils";

export const createMask = function(e) {
  console.log("graph-click");
  this.parent().clearSelect();
  const type = this.attr("type");
  const canvas = this.parent();
  const mask = canvas
    .group()
    .size()
    .attr({ id: "select" })
    .draggable()
    .on("dragstart", function() {
      // 拖动遮罩区域时，隐藏选中图形
      this.mounted.hide();
    });
  mask.color = randomColor();
  mask.mounted = this;
  mask.clone = this.clone()
    .attr({
      stroke: mask.color,
      "stroke-dasharray": "10,10",
    })
    .on("click", function(e) {
      e.stopPropagation();
    })
    .addTo("#select");
  if (type === "rectangle") {
    createRectDraggableCircle.call(mask);
    mask.on("dragend", rectMaskDragendHandler);
  }
  e.stopPropagation();
};

function createRectDraggableCircle() {
  const { x, y, width, height } = this.clone.attr([
    "x",
    "y",
    "width",
    "height",
  ]);
  const points = [
    { cx: x, cy: y },
    { cx: x + width, cy: y + height },
  ];
  this.draggableCircles = points.map(({ cx, cy }, index) => {
    return this.circle()
      .radius(6)
      .attr({
        cx,
        cy,
        fill: this.color,
        index,
      })
      .draggable()
      .on("click", function(e) {
        e.stopPropagation();
      })
      .on("dragstart", function() {
        this.parent().mounted.hide();
      })
      .on("dragmove", rectMaskCircleDragmoveHandler)
      .on("dragend", function() {
        const { width, height, x, y } = this.parent().clone.attr([
          "width",
          "height",
          "x",
          "y",
        ]);
        this.parent().mounted.attr({ width, height, x, y });
        this.parent().mounted.show();
      });
  });
}

function rectMaskDragendHandler() {
  const { x, y, width, height } = this.clone.attr([
    "x",
    "y",
    "width",
    "height",
  ]);
  this.mounted.attr({ x, y, width, height });
  this.mounted.show();
}

function rectMaskCircleDragmoveHandler() {
  const { cx, cy, index } = this.attr(["cx", "cy", "index"]);
  const otherIndex = Number(!index);
  const otherX = this.parent().draggableCircles[otherIndex].attr("cx");
  const otherY = this.parent().draggableCircles[otherIndex].attr("cy");
  this.parent().clone.attr({
    width: Math.abs(cx - otherX),
    height: Math.abs(cy - otherY),
    x: Math.min(cx, otherX),
    y: Math.min(cy, otherY),
  });
}
