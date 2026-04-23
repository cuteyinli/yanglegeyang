/**
 * 第二关 - 挑战开始
 *
 * 8 种图标，多区域布局：
 *   主区域（中央）：5 层金字塔堆叠，共 93 张
 *   左侧小堆：3 层纵向叠放，共 9 张
 *   右侧小堆：3 层纵向叠放，共 9 张
 *   底部暗堆：单层横排，共 9 张
 *
 * 总计 93 + 9 + 9 + 9 = 120 = 8 × 5 × 3 ✓
 */

module.exports = {
  title: '第二关 - 挑战开始',
  iconTypes: 8,
  regions: [
    // ==================== 主区域：中央金字塔 ====================
    {
      x: 0.12, y: 0.1,  // 左上角（相对卡牌可用区域 0~1）
      layers: [
        // {
        //   // 底层：5×5 = 25 张
        //   layer: 0,
        //   gapRatio: 0.1,
        //   cards: [
        //     { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 },
        //     { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 },
        //     { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 }, { col: 4, row: 2 },
        //     { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 }, { col: 4, row: 3 },
        //     { col: 0, row: 4 }, { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 }, { col: 4, row: 4 },
        //   ]
        // },
        {
          // 第二层：5×4 = 20 张，半卡交错
          layer: 1,
          gapRatio: 0.1,
          offsetCol: 0.5,
          offsetRow: 0.5,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 4, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 }, { col: 4, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 }, { col: 4, row: 3 },
          ]
        },
        {
          // 第三层：4×5 = 20 张
          layer: 2,
          gapRatio: 0.1,
          offsetCol: 0.3,
          offsetRow: 0.3,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 },
            { col: 0, row: 4 }, { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 },
          ]
        },
        {
          // 第四层：4×4 = 16 张
          layer: 3,
          gapRatio: 0.1,
          offsetCol: 1,
          offsetRow: 0.5,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 }, { col: 3, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 },
          ]
        },
        {
          // 顶层：3×4 = 12 张
          layer: 4,
          gapRatio: 0.1,
          offsetCol: 1,
          offsetRow: 1,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
            { col: 0, row: 1 }, { col: 1, row: 1 }, { col: 2, row: 1 },
            { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
            { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 },
          ]
        }
      ]
      // 主区域: 25 + 20 + 20 + 16 + 12 = 93
    },

    // ==================== 左侧小堆 ====================
    {
      x: 0.0, y: 0.25,  // 左上角
      layers: [
        {
          layer: 0, gapRatio: 0.08,
          cards: [
            { col: 0, row: 0 }, { col: 0, row: 1 }, { col: 0, row: 2 },
          ]
        },
        {
          layer: 1, gapRatio: 0.08, offsetRow: 0.3,
          cards: [
            { col: 0, row: 0 }, { col: 0, row: 1 }, { col: 0, row: 2 },
          ]
        },
        {
          layer: 2, gapRatio: 0.08, offsetRow: 0.6,
          cards: [
            { col: 0, row: 0 }, { col: 0, row: 1 }, { col: 0, row: 2 },
          ]
        }
      ]
      // 左堆: 9
    },

    // ==================== 右侧小堆 ====================
    {
      x: 0.88, y: 0.25,  // 左上角
      layers: [
        {
          layer: 0, gapRatio: 0.08,
          cards: [
            { col: 0, row: 0 }, { col: 0, row: 1 }, { col: 0, row: 2 },
          ]
        },
        {
          layer: 1, gapRatio: 0.08, offsetRow: 0.3,
          cards: [
            { col: 0, row: 0 }, { col: 0, row: 1 }, { col: 0, row: 2 },
          ]
        },
        {
          layer: 2, gapRatio: 0.08, offsetRow: 0.6,
          cards: [
            { col: 0, row: 0 }, { col: 0, row: 1 }, { col: 0, row: 2 },
          ]
        }
      ]
      // 右堆: 9
    },

    // ==================== 底部暗堆 ====================
    {
      x: 0.10, y: 0.85,  // 左上角
      layers: [
        {
          layer: 0, gapRatio: 0.15,
          cards: [
            { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
            { col: 3, row: 0 }, { col: 4, row: 0 }, { col: 5, row: 0 },
            { col: 6, row: 0 }, { col: 7, row: 0 }, { col: 8, row: 0 },
          ]
        }
      ]
      // 底堆: 9
    }
  ]
  // 总计 93 + 9 + 9 + 9 = 120 = 8 × 5 × 3 ✓
}
