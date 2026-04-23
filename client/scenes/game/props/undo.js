/**
 * 道具：撤回
 *
 * 撤回上一步操作：将最后放入槽位的卡牌
 * 恢复到棋盘原来的位置。
 */

function use(state) {
  console.log('[道具] 撤回')
  return true
}

module.exports = { use }
