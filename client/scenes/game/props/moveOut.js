/**
 * 道具：移出
 *
 * 将槽位中最早放入的 1 张卡牌移出槽位，
 * 放到一个临时暂存区（不占槽位），留出空间继续消除。
 */

function use(state) {
  console.log('[道具] 移出')
  return true
}

module.exports = { use }
