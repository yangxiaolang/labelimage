# labelimage

## What's this
一个前端在线对图片进行数据标注的Vue组件，基于SVG绘制图形对图片进行标注。
你可以直接启动这个工程以立刻开始简单的标注工作，也可以集成到已有的Vue工程中二次开发该组件。

## What it surpported now
现在支持
* 多种图形(矩形、多边形、椭圆和直线)的标注绘制
* 标注图形的拖拽移动、选中调整和显示隐藏
* 标注图片的缩放、移动
* 旋转(目前大体积图片旋转会有明显等待时长)
* 导出可供labelme读取的标注数据

## Next plan
* 大体积图片的旋转优化
* 视图与绘制逻辑的分离
* labelme等外部标注数据的导入