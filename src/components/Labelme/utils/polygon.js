/* eslint-disable no-unused-vars */
import {
  createMaskCircle,
  SelectAttributes,
  createSelectMaskGroup

} from './base';

import { getCanvasRectClientXandY } from './utils';

export const currentNodeMovePosition = (e, zoom) => {
  const { x, y } = getCanvasRectClientXandY();
  return {
    cx: (1 / zoom) * (e.clientX - x),
    cy: (1 / zoom) * (e.clientY - y)
  };
};

export const countCloseNodeShow = (currentNode, closeNode) => {
  const { cx: cx1, cy: cy1 } = closeNode.attr(['cx', 'cy']);
  const { cx: cx2, cy: cy2 } = currentNode.attr(['cx', 'cy']);
  const a = Math.abs(cx2 - cx1);
  const b = Math.abs(cy2 - cy1);
  if (Math.sqrt(a * a + b * b) < 15) {
    currentNode.hide();
    closeNode.show();
  } else {
    currentNode.show();
    closeNode.hide();
  }
};

export const createSelectedPolyMask = (canvas, targetPoly) => {
  const select = createSelectMaskGroup(canvas, targetPoly, () => {
    targetPoly.plot(select.find('polygon')[0].array());
  });
    // 绘制clone，鼠标显示可移动
  const clone = targetPoly
    .clone()
    .attr(Object.assign({}, SelectAttributes))
    .css({
      cursor: 'move'
    })
    .addTo(select);
  const nodes = clone.array();
  nodes.forEach(([cx, cy], index) => {
    createMaskCircle(select, targetPoly)
      .radius(6)
      .attr({ cx, cy, id: `circle${index}` })
      .on('dragend', () => {
        let copy;
        if (index === 0 || index === nodes.length - 1) {
          copy = select.find(`#circle${index === 0 ? nodes.length - 1 : 0}`)[0];
        }
        const node = select.find('#circle' + index)[0];
        const { cx, cy } = node.attr(['cx', 'cy']);
        nodes[index] = [cx, cy];
        if (copy !== undefined) {
          copy.attr({ cx, cy });
          nodes[index === 0 ? nodes.length - 1 : 0] = [cx, cy];
        }
        clone.plot(nodes);
        targetPoly.plot(nodes);
        targetPoly.show();
      })
      .on('dragmove', e => {
        const { cx, cy } = e.detail.box;
        let copy;
        if (index === 0 || index === nodes.length - 1) {
          copy = select.find(`#circle${index === 0 ? nodes.length - 1 : 0}`)[0];
        }
        nodes[index] = [cx, cy];
        if (copy !== undefined) {
          copy.attr({ cx, cy });
          nodes[index === 0 ? nodes.length - 1 : 0] = [cx, cy];
        }
        clone.plot(nodes);
        targetPoly.plot(nodes);
        targetPoly.show();
      });
  });
};

