<template>
  <div class="labelme">
    <div style="display:flex;border:gray 1px solid">
      <div class="tools"
           @click="$refs['board'].clearSelect()">
        <el-divider></el-divider>
        <h3 style="margin:0">{{ currentMode }}</h3>
        <el-divider></el-divider>
        <el-tooltip class="item"
                    effect="dark"
                    content="上传标记图片"
                    placement="right">
          <el-upload class="upload-demo"
                     action="#"
                     :show-file-list="false"
                     :http-request="changeTagImage">
            <el-button slot="trigger"
                       type="text"><i style="font-size:18px;"
                 class="el-icon-folder"></i></el-button>
          </el-upload>
        </el-tooltip>
        <el-tooltip class="item"
                    effect="dark"
                    content="导出JSON文件"
                    placement="right">
          <el-button type="text"
                     @click="exportJSON"><i style="font-size:18px;"
               class="el-icon-download"></i></el-button>
        </el-tooltip>

        <el-divider></el-divider>
        <el-tooltip class="item"
                    effect="dark"
                    content="拖拽工具"
                    placement="right">
          <el-button type="text"
                     :class="drawBoardConfig.mode==='drag'?'active':''"
                     @click="drawBoardConfig.mode='drag'"><i class="iconfont icon-drag"></i></el-button>
        </el-tooltip>
        <el-tooltip class="item"
                    effect="dark"
                    content="矩形工具"
                    placement="right">
          <el-button type="text"
                     :class="drawBoardConfig.mode==='rect'?'active':''"
                     @click="drawBoardConfig.mode='rect'"><i class="iconfont icon-juxing"></i></el-button>
        </el-tooltip>
        <el-tooltip class="item"
                    effect="dark"
                    content="多边形工具"
                    placement="right">
          <el-button type="text"
                     :class="drawBoardConfig.mode==='poly'?'active':''"
                     @click="drawBoardConfig.mode='poly'"><i class="iconfont icon-duobianxing"></i></el-button>
        </el-tooltip>

      </div>
      <div class="main">
        <draw-board ref="board"
                    v-bind.sync="drawBoardConfig"
                    :zoom-config="zoomConfig"
                    :graph-object-list.sync="graphObjectList"
                    :image-width.sync="imageInfo.imageWidth"
                    :image-height.sync="imageInfo.imageHeight"
                    :image-url="imageInfo.imageUrl"></draw-board>
      </div>
      <div class="list"
           @click="$refs['board'].clearSelect()">
        <div class="card">
          <el-divider></el-divider>
          <div style="display:flex;justify-content:space-between;align-item:center">
            <h3 style="margin:0;padding:0 20px">标记管理</h3>
            <!-- <el-button type="text"
                       style="padding:0 10px"
                       @click="$refs['board'].clearAll()">清空</el-button> -->
          </div>
          <el-divider></el-divider>
          <el-table :data="tableData"
                    border
                    @cell-mouse-enter="focus"
                    @cell-mouse-leave="unfocus"
                    @cell-dblclick="changeInput">
            <el-table-column label="序号"
                             type="index"
                             align="center"
                             width="60"></el-table-column>
            <el-table-column label="标记名称"
                             align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.name"
                          @keyup.native.enter="scope.row.edit=false"
                          @input="e=>handleGraphNameChange(scope.row,e)"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作"
                             align="center">
              <template slot-scope="scope">
                <el-button type="text"
                           @click="toggleGraphShow(scope.row)">{{ scope.row.visible?'隐藏':'显示' }}</el-button>
                <el-button type="text"
                           style="color:red;"
                           @click="deleteGraph(scope.row,scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
const ModeMap = new Map([
  ["drag", "拖拽"],
  ["rect", "矩形"],
  ["poly", "多边形"],
]);
import { saveJSON } from "./utils/utils";
import DrawBoard from "./components/DrawBoard.vue";
import "./iconfont.css";
export default {
  name: "",
  components: { DrawBoard },
  data() {
    return {
      imageInfo: {
        imageUrl: "",
        imageName: "",
        imageData: "",
        imageHeight: 0,
        imageWidth: 0,
      },
      graphObjectList: [],
      drawBoardConfig: {
        mode: "drag",
        zoom: 1,
        ratio: 1,
        bitScale: 1,
      },
      zoomConfig: {
        zoomFactor: 0.1,
        zoomMin: 0.5,
        zoomMax: 20,
      },
    };
  },
  computed: {
    currentMode() {
      return ModeMap.get(this.drawBoardConfig.mode);
    },
    tableData() {
      return this.graphObjectList.map((graph) => {
        const { name, id, type } = graph.attr();
        return {
          name,
          id,
          type,
          visible: true,
          mountedDOM: graph,
          edit: false,
        };
      });
    },
  },
  methods: {
    handleGraphNameChange(row, e) {
      row.mountedDOM.attr({
        name: e,
      });
    },
    changeTagImage(param) {
      const { file } = param;
      this.graphObjectList = [];
      this.imageInfo.imageUrl = URL.createObjectURL(file);

      this.imageInfo.imageName = file.name.split('.')[0];
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.onload = () => {
        this.imageInfo.imageData = fr.result.split("base64,")[1];
      };
    },
    focus(row) {
      row.mountedDOM.attr({
        stroke: "red",
        "stroke-width": 3,
      });
    },
    unfocus(row) {
      const color = row.mountedDOM.attr("color");
      row.mountedDOM.attr({
        stroke: color,
      });
    },
    toggleGraphShow(row) {
      row.visible ? row.mountedDOM.hide() : row.mountedDOM.show();
      row.visible = !row.visible;
    },
    deleteGraph(row, index) {
      row.mountedDOM.remove();
      this.graphObjectList.splice(index, 1);
    },
    changeInput(row) {
      row.edit = true;
      this.tableData.forEach((graph) => {
        if (graph.id !== row.id) {
          graph.edit = false;
        }
      });
    },
    exportJSON() {
      if (this.imageInfo.imageUrl !== "") {
        const shapes = this.tableData.map((row) => {
          const graph = row.mountedDOM;
          const graphType = graph.attr("type");
          const vectorMap = [];
          if (graphType === "rectangle") {
            const { x, x2, y, y2 } = graph.bbox();
            vectorMap.push([x, y]);
            vectorMap.push([x2, y2]);
          } else if (graphType === "polygon") {
            const points = graph.array();
            points.pop();
            points.forEach((point) => {
              vectorMap.push(point);
            });
          }
          const bitMap = vectorMap.map((point) => {
            return point.map((num) => num * this.drawBoardConfig.bitScale);
          });
          return {
            label: row.name,
            points: bitMap,
            shape_type: graphType,
          };
        });
        const { imageName, imageData, imageHeight, imageWidth } =
          this.imageInfo;
        saveJSON(
          JSON.stringify({
            version: "aiopen_online_tag_tool",
            flag: {},
            shapes,
            imagePath: imageName,
            imageData,
            imageWidth,
            imageHeight,
          }),
          imageName
        );
      } else {
        this.$message.warning("请先上传图片");
      }
    },
  },
};
</script>
<style scoped>
.labelme {
  display: flex;
  justify-content: center;
  width: auto;
}

.labelme >>> .el-divider {
  margin: 4px 0;
}

.tools {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tools >>> .el-button {
  font-size: 18px;
  margin: 0;
  padding: 15px 25px;
  color: gray;
}

.active >>> i {
  color: blue;
}

.card {
  width: 350px;
}

.card >>> .el-table {
  font-size: 14px;
}

.card >>> .el-table--medium th {
  padding: 5px;
}

.card >>> .el-table--medium td {
  padding: 5px;
}
</style>
