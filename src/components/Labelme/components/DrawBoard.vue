<template>
  <div id="board"
       class="board"
       style="background:rgb(244,244,244)">
  </div>
</template>
<script>
import { loadImage, enhanceCanvas } from "../utils/init";
export default {
  name: "Board",
  props: {
    mode: String,
    graphObjectList: Array,
    zoom: Number,
    bitScale: Number,
    zoomConfig: Object,
    ratio: Number,
    imageUrl: String,
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
        this.canvas.createDrawLayer(this.mode);
      }
    },
    imageUrl() {
      this.$emit("update:mode", "drag");
      this.view.zoom(1);
      this.view.zoomNum = 1;
      this.view.viewbox(0, 0, this.width, this.height);
      this.canvas.children().forEach((child) => {
        child.remove();
      });
      if (this.imageUrl !== "") {
        this.initCanvas(this.imageUrl);
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
      this.$emit("update:zoom", lvl.detail.level);
    });
    this.canvas = this.view.group().attr({ id: "canvas" })
    this.canvas.on('click',function(){
      this.clearSelect()
    })
    enhanceCanvas(this.canvas, this);
  },
  methods: {
    clearSelect() {
      this.canvas.clearSelect();
    },
    initCanvas: async function (imageUrl) {
      const image = await loadImage(imageUrl);
      const { width, height } = image;
      const ratio = height / width;
      const expectWidth = this.width * 0.75;
      this.$emit("update:imageWidth", width);
      this.$emit("update:imageHeight", height);
      this.$emit("update:ratio", ratio);
      this.$emit("update:bitScale", width / expectWidth);
      this.canvas.loadImage(imageUrl).size(expectWidth, expectWidth * ratio);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.board {
  display: flex;
  justify-content: center;
  background-color: rgb(244, 244, 244);
}
</style>
