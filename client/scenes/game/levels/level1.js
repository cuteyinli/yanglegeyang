/**
 * 第一关 - 新手引导
 *
 * 3 种图标，3 层各 3×3 = 27 张卡牌
 * 层间 offsetRow 产生交错遮挡
 */

module.exports = {
  title: '第一关 - 新手引导',
  iconTypes: 3,       // 3 种图标，每种 3 张 = 9 张
  regions: [
    {
      x: 0.15, y: 0.3,   // 左上角（相对卡牌可用区域 0~1）
      layers: [
        {
          layer: 0, gapRatio: 0.9,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
          ]
        },
        {
          layer: 1, gapRatio: 0.9, offsetRow: 0.15,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
          ]
        },
        {
          layer: 2, gapRatio: 0.9, offsetRow: 0.3,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
          ]
        }
      ]
    }
  ]
}
