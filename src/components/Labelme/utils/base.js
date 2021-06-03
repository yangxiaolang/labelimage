/* eslint-disable no-unused-vars */
export const createSelectMaskGroup = (canvas, mountElement, dragendHandler) => {
  return canvas
    .group()
    .size()
    .attr({ id: 'select', target: mountElement.attr('id') })
    .draggable()
    .on('dragstart', () => {
    // 拖动遮罩区域时，隐藏选中矩形
      mountElement.hide();
    })
    .on('dragend', e => {
    // 遮罩区域拖动结束时，将位置信息更新到原矩形上并显示原矩形
      dragendHandler(e)
      mountElement.show();
    });
}

export const createMaskCircle = (
  canvas,
  mountElement
) => {
  return canvas
    .circle()
    .attr({ fill: 'blue', 'fill-opacity': 0.8 })
    .css({
      cursor: 'pointer'
    })
    .draggable()
    .on('dragstart', () => {
      mountElement.hide();
    })
};

export const SelectAttributes = {
  stroke: 'blue',
  'stroke-width': 4,
  fill: 'white',
  'fill-opacity': 0.5,
  'stroke-dasharray': '10,10',
  'stroke-opacity': 0.4,
  id: 'fill'
}

