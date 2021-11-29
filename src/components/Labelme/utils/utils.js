import { Random } from "mockjs";

export const getCanvasRectClientXandY = () => {
  const canvas = document.getElementById("canvas");
  return canvas === null ? { x: 0, y: 0 } : canvas.getClientRects()[0];
};

export const saveJSON = (data, filename) => {
  const blob = new Blob([data], { type: "text/json" });
  // const e = document.createEvent('MouseEvents');
  const a = document.createElement("a");
  a.download = `${filename}.json`;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
  a.click();
  // e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  // a.dispatchEvent(e)
};

export const currentNodeMovePosition = (e, zoom) => {
  const { x, y } = getCanvasRectClientXandY();
  return [(1 / zoom) * (e.clientX - x), (1 / zoom) * (e.clientY - y)];
};

export const randomColor = () => {
  return Random.color();
};

export const dataURLtoBlob = (dataurl) => {
  const uint8 = getUint8Arr(dataurl);
  return new Blob([uint8.u8arr], { type: uint8.mime });
};

/**
 * 二进制容器
 * @param {String} dataurl
 */
const getUint8Arr = (dataurl) => {
  // 截取base64的数据内容
  let arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    // 获取解码后的二进制数据的长度，用于后面创建二进制数据容器
    n = bstr.length,
    // 创建一个Uint8Array类型的数组以存放二进制数据
    u8arr = new Uint8Array(n);
  // 将二进制数据存入Uint8Array类型的数组中
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return { u8arr, mime };
};

/**
 * @typedef {{x:number,y:number}} basePoint
 */
/**
 * @function 计算绕某点旋转90度后点坐标
 * @param {number} x
 * @param {number} y
 * @param {basePoint} basePoint
 * @returns {basePoint}
 */
 export const rotateLocation = (x, y, basePoint) => {
   // 因为坐标系是向右向下为正，顺时针90度-Π/2 其实是计算逆时针的Π/2
   return {
    x:  basePoint.y + basePoint.x-y,
    y: basePoint.y + (x - basePoint.x),
  };
  //js的90度余弦值有精度问题不是0，反正是顺时针90度，直接将正余弦值写死
  //   return {
  //     x:
  //       (x - basePoint.x) * Math.cos(-0.5 * Math.PI) -
  //       (y - basePoint.y) * Math.sin(-0.5 * Math.PI) +
  //       basePoint.x,
  //     y:
  //       (y - basePoint.y) * Math.cos(-0.5 * Math.PI) +
  //       (x - basePoint.x) * Math.sin(-0.5 * Math.PI) +
  //       basePoint.y,
  //   };
};
