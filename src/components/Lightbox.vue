<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { useLightbox } from '@/composables/useLightbox.js'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const { state, current, counter, open, close, next, prev } = useLightbox()

function openByIndex(index) {
  open(index, props.items)
  document.body.style.overflow = 'hidden'
}

function onClose() {
  close()
  document.body.style.overflow = ''
  emit('close')
}

function onKeydown(e) {
  if (!state.isOpen) return
  if (e.key === 'Escape') onClose()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

// 预加载相邻原图，提升切换流畅度
function preload(adjIndex) {
  const item = state.items[adjIndex]
  if (!item) return
  const img = new Image()
  img.src = item.lightbox.src
}

watch(
  () => [state.isOpen, state.index],
  ([open, idx]) => {
    if (!open) return
    preload(idx + 1)
    preload(idx - 1)
  }
)

watch(
  () => state.isOpen,
  (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('keydown', onKeydown)
    }
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const exifFields = computed(() => {
  const exif = current.value?.lightbox?.exif
  if (!exif) return []
  const fields = [exif.camera, exif.aperture, exif.shutter, exif.iso].filter(Boolean)
  return fields
})

const exifDate = computed(() => {
  const dateStr = current.value?.lightbox?.exif?.date
  if (!dateStr) return null
  return dateStr.replace(/\./g, '-')
})

const hasMany = computed(() => state.items.length > 1)

defineExpose({ openByIndex })
</script>

<template>
  <Transition name="lb-fade">
    <div
      v-if="state.isOpen && current"
      class="lb"
      role="dialog"
      aria-modal="true"
      :aria-label="current.lightbox.title || current.alt"
      @click.self="onClose"
    >
      <!-- 背景遮罩 -->
      <div class="lb__bg" />

      <!-- 关闭按钮 -->
      <button class="lb__btn lb__btn--close" type="button" aria-label="关闭" @click="onClose">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M5 5l14 14M19 5L5 19"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="square"
          />
        </svg>
      </button>

      <!-- 计数器 -->
      <div v-if="hasMany" class="lb__counter">{{ counter }}</div>

      <!-- 上一张 -->
      <button
        v-if="hasMany"
        class="lb__btn lb__btn--nav lb__btn--prev"
        type="button"
        aria-label="上一张"
        @click="prev"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M15 4l-8 8 8 8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="square"
            stroke-linejoin="miter"
          />
        </svg>
      </button>

      <!-- 下一张 -->
      <button
        v-if="hasMany"
        class="lb__btn lb__btn--nav lb__btn--next"
        type="button"
        aria-label="下一张"
        @click="next"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M9 4l8 8-8 8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="square"
            stroke-linejoin="miter"
          />
        </svg>
      </button>

      <!-- 图片与信息栏容器 -->
      <div class="lb__frame">
        <div class="lb__stage">
          <Transition name="lb-img" mode="out-in">
            <img
              :key="current.id"
              class="lb__img"
              :src="current.lightbox.src"
              :alt="current.alt || current.lightbox.title"
              :width="current.lightbox.width"
              :height="current.lightbox.height"
              draggable="false"
            />
          </Transition>
        </div>

        <!-- 图片信息栏：跟随图片左下角 -->
        <figcaption v-if="current.lightbox.title || exifFields.length" class="lb__caption">
          <div v-if="current.lightbox.title || exifDate" class="lb__caption-title">
            {{ current.lightbox.title }}<template v-if="current.lightbox.title && exifDate"> | </template>{{ exifDate }}
          </div>
          <div v-if="exifFields.length" class="lb__caption-exif">
            {{ exifFields.join(' ') }}
          </div>
        </figcaption>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.lb {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 上下留出间距 */
  padding: 90px 24px 80px;
}

.lb__bg {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0.96;
  cursor: default;
}

/* 按钮：直角、白色 70% 不透明 */
.lb__btn {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  border-radius: 0;
  color: #fff;
  opacity: 0.7;
  cursor: pointer;
  padding: 12px;
  transition: opacity 0.2s ease-out, background-color 0.2s ease-out;
  font: inherit;
}
.lb__btn:hover,
.lb__btn:focus-visible {
  opacity: 1;
  outline: none;
}
.lb__btn:focus-visible {
  background-color: rgba(255, 255, 255, 0.08);
}

.lb__btn--close {
  top: 16px;
  right: 16px;
}

.lb__btn--nav {
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
}
.lb__btn--prev {
  left: 16px;
}
.lb__btn--next {
  right: 16px;
}

/* 图片与信息栏容器：垂直堆叠，对齐左边缘 */
.lb__frame {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 图片舞台 */
.lb__stage {
  max-width: 100%;
  max-height: calc(100vh - 24px - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lb__img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 48px - 80px);
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 0;
  user-select: none;
  -webkit-user-drag: none;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
}

/* 计数器：左上角（与灯箱视口对齐） */
.lb__counter {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  font-family: var(--font-mono);
  font-size: 15px;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

/* 图片信息栏：跟随图片左下角 */
.lb__caption {
  position: relative;
  width: 100%;
  padding: 10px 0 0;
  text-align: left;
  color: #fff;
  pointer-events: none;
}

.lb__caption-title {
  font-family: var(--font-hans);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
}

.lb__caption-exif {
  font-family: var(--font-elegance);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.7);
  text-transform: none;
}

/* —— 过渡 —— */
.lb-fade-enter-active,
.lb-fade-leave-active {
  transition: opacity 0.28s ease-out;
}
.lb-fade-enter-from,
.lb-fade-leave-to {
  opacity: 0;
}

.lb-img-enter-active,
.lb-img-leave-active {
  transition: opacity 0.32s ease-out, transform 0.32s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}
.lb-img-enter-from {
  opacity: 0;
  transform: scale(0.97);
}
.lb-img-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

/* 尊重无障碍偏好 */
@media (prefers-reduced-motion: reduce) {
  .lb-fade-enter-active,
  .lb-fade-leave-active,
  .lb-img-enter-active,
  .lb-img-leave-active {
    transition: none;
  }
  .lb-img-enter-from,
  .lb-img-leave-to {
    transform: none;
  }
}
</style>
