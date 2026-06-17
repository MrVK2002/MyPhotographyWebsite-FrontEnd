import { onMounted, onBeforeUnmount, ref } from 'vue'
import Lenis from 'lenis'

/**
 * Lenis 阻尼滚动 composable
 * - 尊重 prefers-reduced-motion
 * - 自动 raf 循环
 * - 支持外部调用 resize() 刷新滚动边界（如 MasonryGrid 重排后）
 * - 卸载时清理
 */
export function useSmoothScroll() {
  const lenis = ref(null)
  const enabled = ref(false)
  let rafId = null

  function init() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      enabled.value = false
      return
    }

    const instance = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true
    })

    function raf(time) {
      instance.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    lenis.value = instance
    enabled.value = true
  }

  /** 通知 Lenis 重新计算滚动边界（供 MasonryGrid 等动态高度组件调用） */
  function resize() {
    lenis.value?.resize()
  }

  function destroy() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (lenis.value) {
      lenis.value.destroy()
      lenis.value = null
    }
    enabled.value = false
  }

  onMounted(init)
  onBeforeUnmount(destroy)

  return { lenis, enabled, resize }
}
