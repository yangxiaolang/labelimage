<template>
  <div
    id="board"
    class="board"
    style="background:rgb(244,244,244)"
  >
  </div>
</template>
<script>
import {
  createSelectedRectMask,
  createRect,
  getRectClickPosition
} from '../utils/rect';
import {
  createSelectedPolyMask,
  currentNodeMovePosition,
  countCloseNodeShow
} from '../utils/polygon';

export default {
  name: 'Board',
  props: {
    mode: String,
    graphObjectList: Array,
    zoom: Number,
    bitScale: Number,
    zoomConfig: Object,
    ratio: Number,
    imageUrl: String,
    imageHeight: Number,
    imageWidth: Number
  },
  data() {
    return {
      view: null,
      canvas: null,
      count: 0,
      polyNodeStack: [],
      currentPolyPath: null,
      currentPolyNode: null
    };
  },
  watch: {
    mode() {
      if (this.mode !== 'drag') {
        this.canvas.css({
          cursor: 'pointer'
        })
      } else {
        this.canvas.css({
          cursor: 'default'
        })
      }
      this.polyInit()
    },
    imageUrl() {
      this.view.zoom(1)
      this.view.viewbox(0, 0, 800, 600)
      this.canvas.children().forEach(child => {
        child.remove()
      })
      if (this.imageUrl !== '') {
        this.initCanvas(this.imageUrl)
      }
    }
  },
  mounted() {
    this.view = this.$svg()
      .addTo('#board')
      .size(800, 600)
      .viewbox(0, 0, 800, 600)
      .panZoom(this.zoomConfig);
    this.view.on('zoom', (lvl) => {
      this.$emit('update:zoom', lvl.detail.level);
    });
    this.canvas = this.view.group().attr({ id: 'canvas' });
  },
  methods: {
    initCanvas(imageUrl) {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        const ratio = image.height / image.width;
        this.$emit('update:imageWidth', image.width)
        this.$emit('update:imageHeight', image.height)
        this.$emit('update:ratio', ratio)
        const background = this.canvas
          .image(imageUrl).attr({ id: 'background' })
          .size(600, 600 * ratio);
        this.$emit('update:bitScale', image.width / 600);
        background.on('click', this.backgroundClickHandler);
        background.on('mousemove', this.polyBackgroundMousemoveHandler);
      };
    },
    attachPolyNodeClick(e) {
      return this.canvas
        .circle()
        .radius(6)
        .attr(
          Object.assign(
            {
              fill: 'blue',
              'fill-opacity': 0.4,
              class: 'node'
            },
            currentNodeMovePosition(e, this.zoom)
          )
        )
        .css({
          cursor: 'pointer'
        })
        .on('click', (e) => {
          if (this.currentPolyNode.attr('id') === 'startnode') {
            const closeCircle = this.canvas
              .circle()
              .radius(15)
              .attr({
                cx: this.currentPolyNode.attr('cx'),
                cy: this.currentPolyNode.attr('cy'),
                fill: 'blue',
                'fill-opacity': 0.2,
                id: 'close',
                class: 'node'
              })
              .hide();
            closeCircle.on('click', () => {
              const pathDataStr =
                this.currentPolyPath.array().join().replaceAll(',', ' ') +
                `L ${closeCircle.attr('cx')} ${closeCircle.attr('cy')}z`;
              const poly = this.currentPolyPath
                .plot(pathDataStr)
                .toPoly()
                .attr({
                  stroke: 'none',
                  fill: 'white',
                  'fill-opacity': 0.5,
                  id: 'poly' + this.count++,
                  type: 'polygon',
                  name: 'untitled'
                })
                .on('click', () => {
                  this.select(poly, 'poly');
                });
              this.$emit(
                'update:graphObjectList',
                this.graphObjectList.concat([poly])
              );
              this.$emit('update:mode', 'drag');
              this.canvas.find('circle').forEach((circle) => circle.remove());
              this.select(poly, 'poly');
            });
          }
          this.polyNodeStack.push(this.currentPolyNode);
          this.currentPolyNode = this.attachPolyNodeClick(e);
          const lastPolyNode = this.polyNodeStack[
            this.polyNodeStack.length - 1
          ];
          if (this.polyNodeStack.length === 1) {
            this.currentPolyPath = this.canvas
              .path()
              .plot(`M ${lastPolyNode.attr('cx')} ${lastPolyNode.attr('cy')}`)
              .attr({
                fill: 'none',
                stroke: 'blue',
                'stroke-opacity': 0.4,
                'stroke-width': 3
              });
          } else if (this.polyNodeStack.length > 1) {
            const pathDataStr =
              this.currentPolyPath.array().join().replaceAll(',', ' ') +
              `L ${lastPolyNode.attr('cx')} ${lastPolyNode.attr('cy')}`;
            this.currentPolyPath.plot(pathDataStr);
          } else {
            return;
          }
        })
        .on('mousemove', this.polyNodeMousemoveHandler);
    },
    polyNodeMousemoveHandler(e) {
      this.currentPolyNode.attr(currentNodeMovePosition(e, this.zoom));
      if (this.polyNodeStack.length > 2) {
        const close = this.canvas.find('#close')[0];
        countCloseNodeShow(this.currentPolyNode, close);
      }
    },
    polyBackgroundMousemoveHandler(e) {
      if (this.mode === 'poly') {
        if (this.currentPolyNode === null) {
          this.currentPolyNode = this.attachPolyNodeClick(e).attr({
            id: 'startnode'
          });
        } else {
          this.polyNodeMousemoveHandler(e);
        }
      }
      return;
    },
    select(target, targetShape) {
      this.clearSelect();
      if (targetShape === 'rect') {
        createSelectedRectMask(this.canvas, target);
      } else if (targetShape === 'poly') {
        createSelectedPolyMask(this.canvas, target);
      }
    },
    backgroundClickHandler(e) {
      if (this.mode !== 'poly') {
        if (this.mode === 'drag') {
          this.clearSelect();
        } else if (this.mode === 'rect') {
          const rect = createRect(
            this.canvas,
            this.ratio,
            Object.assign(
              {
                fill: 'white',
                'fill-opacity': 0.5,
                id: 'rect' + this.count++,
                name: 'untitled',
                type: 'rectangle'
              },
              getRectClickPosition(this.zoom, e)
            ),
            () => {
              this.select(rect, 'rect');
            }
          );
          this.select(rect, 'rect');
          this.$emit('update:mode', 'drag');
          this.$emit(
            'update:graphObjectList',
            this.graphObjectList.concat([rect])
          );
        }
      }
    },
    clearSelect() {
      const select = document.getElementById('select');
      if (select !== null) {
        document
          .getElementById('canvas')
          .removeChild(document.getElementById('select'));
      }
    },
    clearAll() {
      this.canvas.children().forEach(child => {
        if (child.attr('id') !== 'background') { child.remove() }
      })
      this.polyInit()
      this.$emit('update:graphObjectList', [])
    },
    polyInit() {
      this.polyNodeStack = [];
      this.currentPolyPath = null;
      this.currentPolyNode = null;
      this.canvas.find('.node').forEach((circle) => circle.remove());
      this.canvas.find('path').forEach((path) => path.remove());
    }
  }
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
