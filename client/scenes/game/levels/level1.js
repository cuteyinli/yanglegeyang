/**
 * 第一关 - 新手引导
 *
 * 3 种图标，3 层各 3×3 = 27 张卡牌
 * 层间 offsetRow 产生交错遮挡
 */

module.exports = {
  title: '第一关 - 新手引导',
  iconTypes: 3,       // 3 种图标，每种 3 张 = 9 张
  cardScale: 0.17,    // 卡牌尺寸 = 屏幕宽度 × 0.17
  gapScale: 0.16,     // 卡牌间距 = 屏幕宽度 × 0.16
  boardTop: 0.25,     // 棋盘顶部（屏幕高度比例）
  layers: [
    {
      layer: 0,
      cards: [
        { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
        { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      ]
    },
    {
      layer: 1,
      offsetRow: 0.15,
      cards: [
        { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
        { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      ]
    },
    {
      layer: 2,
      offsetRow: 0.3,
      cards: [
        { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
        { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      ]
    }
  ]
}
