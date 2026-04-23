/**
 * 第二关 - 挑战开始
 *
 * 9 种图标，三层堆叠：底层 4×4、中层 3×3、顶层 2×1
 * 总计 16 + 9 + 2 = 27 = 9 × 3 ✓
 */

module.exports = {
  title: '第二关 - 挑战开始',
  iconTypes: 9,       // 9 种图标
  cardScale: 0.12,    // 卡牌尺寸 = 屏幕宽度 × 0.12
  gapScale: 0.1,      // 卡牌间距 = 屏幕宽度 × 0.1
  boardTop: 0.10,
  layers: [
    {
      // 底层：4×4 = 16 张
      layer: 0,
      cards: [
        { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 },
        { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
        { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 },
      ]
    },
    {
      // 中层：3×3 = 9 张，偏移半卡交错
      layer: 1,
      offsetCol: 0.5,
      offsetRow: 0.5,
      cards: [
        { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
        { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
        { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      ]
    },
    {
      // 顶层：2×1 = 2 张
      layer: 2,
      offsetCol: 1,
      offsetRow: 1.5,
      cards: [
        { col: 0, row: 0 }, { col: 1, row: 0 },
      ]
    }
  ]
  // 总计 16 + 9 + 2 = 27 = 9 × 3 ✓
}
