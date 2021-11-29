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
    const image =this.findOne('#background') 
    if(image){
      image.load(imageUrl)
      return image
    }else{
      this.labelImage = this.image(imageUrl).attr({ id: "background" });
      return this.labelImage;
    }
  };
  canvas.clear= function(){
      this.children().forEach((child) => {
        child.remove();
      });
  },
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
