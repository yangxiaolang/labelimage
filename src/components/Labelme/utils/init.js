import { createDrawLayer } from "./drawLayer";

export const loadImage = (url) => {
  return new Promise((res) => {
    const image = new Image();
    image.onload = () => {
      res(image);
    };
    image.src = url;
  });
};

export const enhanceCanvas = (canvas, that) => {
  canvas.loadImage = function(imageUrl) {
    this.labelImage = this.image(imageUrl).attr({ id: "background" });
    return this.labelImage;
  };
  canvas.createDrawLayer = createDrawLayer;
  canvas.drawDone = function(graph) {
    this.findOne("#drawLayer").remove();
    this.root().off("mousemove");
    that.$emit("update:mode", "drag");
    that.$emit("update:graphObjectList", that.graphObjectList.concat([graph]));
  };
  canvas.clearSelect = function() {
    this.find("#select").forEach((el) => {
      el.remove();
    });
  };
  canvas.drawCancel = function() {
    this.findOne("#drawLayer").remove();
    this.root().off("mousemove");
    that.$emit("update:mode", "drag");
  };
};
