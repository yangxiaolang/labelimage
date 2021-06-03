/* eslint-disable no-unused-vars */
import {
  createMaskCircle,
  SelectAttributes,
  createSelectMaskGroup
} from './base';
import { getCanvasRectClientXandY } from './utils';
// 为选中的矩形创建遮罩区域
export const createSelectedRectMask = (canvas, targetRect) => {
  const { width, height, x, y } = targetRect.attr();
  const nodesId = ['start', 'end'];
  const select = createSelectMaskGroup(canvas, targetRect, e => {
    const { x, y } = e.detail.box;
    targetRect.attr({ x: x + 6, y: y + 6 });
  });
  select.rect(width, height).attr(Object.assign(SelectAttributes, { x, y }));
  // 绘制矩形，鼠标显示可移动
  nodesId.forEach(id => {
    createMaskCircle(select, targetRect)
      .radius(6)
      .attr({
        cx: id === 'start' ? x : x + width,
        cy: id === 'start' ? y : y + height,
        id
      })
      .on('dragend', () => {
        const { width, height, x, y } = select.find('#fill')[0].attr();
        targetRect.attr({ width, height, x, y });
        targetRect.show();
      })
      .on('dragmove', () => {
        const { cx: end_cx, cy: end_cy } = select
          .find('#end')[0]
          .attr(['cx', 'cy']);
        const { cx: start_cx, cy: start_cy } = select
          .find('#start')[0]
          .attr(['cx', 'cy']);
        const fill = select.find('#fill')[0];
        fill.attr({
          width: Math.abs(end_cx - start_cx),
          height: Math.abs(end_cy - start_cy),
          x: Math.min(end_cx, start_cx),
          y: Math.min(end_cy, start_cy)
        });
      });
  });
};

// 在图片上绘制矩形区域
export const createRect = (canvas, ratio, rectAttrs, clickHandler) => {
  return canvas
    .rect(100, 100 * ratio)
    .attr(rectAttrs)
    .draggable()
    .on('click', clickHandler);
};

export const getRectClickPosition = (zoom, e) => {
  const { x, y } = getCanvasRectClientXandY();
  return {
    x: (1 / zoom) * (e.clientX - x),
    y: (1 / zoom) * (e.clientY - y)
  };
};
