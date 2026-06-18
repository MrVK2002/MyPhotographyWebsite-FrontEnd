import { reactive, readonly, computed } from 'vue'

/**
 * Lightbox composable（纯手写，不依赖 PhotoSwipe）
 * - 单例状态：所有 Lightbox.vue 实例共享同一个打开态
 * - 键盘导航：←/→ 切换，Esc 关闭
 * - 预加载：切换时预加载相邻原图
 */
const state = reactive({
  isOpen: false,
  items: [],
  index: 0
})

function next() {
  if (state.items.length < 2) return
  state.index = (state.index + 1) % state.items.length
}

function prev() {
  if (state.items.length < 2) return
  state.index = (state.index - 1 + state.items.length) % state.items.length
}

function close() {
  state.isOpen = false
  state.items = []
  state.index = 0
}

/**
 * 打开灯箱
 * @param {number} index 当前打开的图片索引
 * @param {Array} items 与 MasonryGrid 一致的 items 列表（含 lightbox 字段）
 */
function open(index, items) {
  state.items = items
  state.index = index
  state.isOpen = true
}

const current = computed(() => state.items[state.index] || null)

const counter = computed(() => {
  if (!state.items.length) return ''
  return `${state.index + 1} / ${state.items.length}`
})

export function useLightbox() {
  return {
    state: readonly(state),
    current,
    counter,
    open,
    close,
    next,
    prev
  }
}
