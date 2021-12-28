<template>
  <div style="postion:relative">
    <div id="board"
         oncontextmenu="return false;"
         class="board"
         style="background:rgb(244,244,244)">
    </div>
  </div>
</template>
<script>
import { loadImage, enhanceCanvas } from "../utils/init";
import { rotateLocation } from "../utils/utils";
export default {
  name: "Board",
  props: {
    mode: String,
    graphObjectList: Array,
    zoom: Number,
    bitScale: Number,
    zoomConfig: Object,
    ratio: Number,
    // imageUrl: String,
    imageHeight: Number,
    imageWidth: Number,
    width: {
      type: Number,
      default: () => {
        return 800;
      },
    },
    height: {
      type: Number,
      default: () => {
        return 600;
      },
    },
  },
  data() {
    return {
      view: null,
      canvas: null,
      count: 0,
      polyNodeStack: [],
      currentPolyPath: null,
      currentPolyNode: null,
    };
  },
  watch: {
    mode() {
      this.canvas.css({
        cursor: this.mode !== "drag" ? "pointer" : "default",
      });

      this.canvas.find("#drawLayer").remove();
      if (this.mode !== "drag") {
        this.canvas.on("contextmenu", this.canvas.drawCancel);
        this.canvas.on("mousedown", (e) => e.stopPropagation());
        this.canvas.createDrawLayer(this.mode);
      } else {
        this.canvas.off("mousedown");
        this.canvas.off("contextmenu");
      }
    },
  },
  mounted() {
    this.view = this.$svg()
      .addTo("#board")
      .size(this.width, this.height)
      .viewbox(0, 0, this.width, this.height)
      .panZoom(this.zoomConfig);
    this.view.zoomNum = 1;

    this.view.on("zoom", (lvl) => {
      this.view.zoomNum = lvl.detail.level;
      this.canvas.find("rect").forEach((rect) => {
        rect.attr({
          "stroke-width": 3 / lvl.detail.level,
        });
      });
      this.canvas.find("path").forEach((path) => {
        path.attr({
          "stroke-width": 3 / lvl.detail.level,
        });
      });
      this.canvas.find("polyline").forEach((polyline) => {
        polyline.attr({
          "stroke-width": 3 / lvl.detail.level,
        });
      });
      this.canvas.find("circle").forEach((circle) => {
        circle.radius(6 / lvl.detail.level);
      });
      this.$emit("update:zoom", lvl.detail.level);
    });
    this.canvas = this.view.group().attr({ id: "canvas" });
    this.canvas.on("click", function () {
      this.clearSelect();
    });

    enhanceCanvas(this.canvas, this);
    this.canvas.ellipse(200, 100).attr({
      cx:100,
      cy:50,
      fill:'none',
      stroke:'black'
    })
    this.canvas.rect(200, 100).attr({
      fill:'none',
      stroke:'black'
    })
  },
  methods: {
    resize() {
      this.view.zoom(1);
      this.view.zoomNum = 1;
      this.view
        .size(this.width, this.height)
        .viewbox(0, 0, this.width, this.height);
    },
    changeLabelImage: async function (url, mode) {
      this.$emit("update:mode", "drag");
      this.view.zoom(1);
      this.view.zoomNum = 1;
      this.view.viewbox(0, 0, this.width, this.height);
      // this.canvas.children().forEach((child) => {
      //   child.remove();
      // });
      if (url !== "") {
        await this.initCanvas(url, mode);
      }
    },
    clearSelect() {
      this.canvas.clearSelect();
    },
    initCanvas: async function (imageUrl, mode) {
      const image = await loadImage(imageUrl);
      const { width, height } = image;
      const ratio = height / width;
      const expectWidth = this.width * 0.75;
      const bitScale = width / expectWidth;
      if (mode) {
        this.rotateLable(width, bitScale);
      }
      this.$emit("update:imageWidth", width);
      this.$emit("update:imageHeight", height);
      this.$emit("update:ratio", ratio);
      this.$emit("update:bitScale", bitScale);
      this.canvas.loadImage(imageUrl).size(expectWidth, expectWidth * ratio);
    },
    rotateLable(imageWidth, bitScale) {
      this.graphObjectList.forEach((graph) => {
        console.log(graph);
        if (graph.type === "rect") {
          const { x, y, width, height } = graph.attr([
            "x",
            "y",
            "width",
            "height",
          ]);
          const { x: x1, y: y1 } = rotateLocation(
            x * this.bitScale,
            (y + height) * this.bitScale,
            { x: 0, y: 0 }
          );
          graph.attr({
            x: Math.round(imageWidth + x1) / bitScale,
            y: Math.round(y1) / bitScale,
            width: (height * this.bitScale) / bitScale,
            height: (width * this.bitScale) / bitScale,
          });
        } else if (graph.type === "polyline") {
          const tempPathArray = [...graph.array()].map((location) => {
            const { x, y } = rotateLocation(
              ...location.map((el) => el * this.bitScale),
              { x: 0, y: 0 }
            );
            return [Math.round(imageWidth + x), Math.round(y)].map(
              (el) => el / bitScale
            );
          });
          graph.plot(tempPathArray.join().replaceAll(",", " "));
        }
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.board {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background-color: rgb(244, 244, 244);
}
</style>
