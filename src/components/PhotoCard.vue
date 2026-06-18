<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, default: 0 }
})

const loaded = ref(false)
const failed = ref(false)

// 错落延迟，前 12 张立刻铺开，后续每张递增 40ms
const delay = computed(() => {
  return `${Math.min(props.index, 12) * 40}ms`
})

// 3D 拾起效果：鼠标相对卡片的归一化位置 (-0.5 ~ 0.5)
const tilt = ref({ x: 0, y: 0 })
const isHovered = ref(false)

function onLoad() {
  loaded.value = true
}

function onError() {
  failed.value = true
  loaded.value = true
}

function onMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  tilt.value = {
    x: (e.clientX - rect.left) / rect.width - 0.5,
    y: (e.clientY - rect.top) / rect.height - 0.5
  }
}

function onMouseEnter() {
  isHovered.value = true
}

function onMouseLeave() {
  isHovered.value = false
  tilt.value = { x: 0, y: 0 }
}
</script>

<template>
  <div
    class="photo-card"
    :class="{ 'is-loaded': loaded, 'is-failed': failed, 'is-hovered': isHovered }"
    :style="{
      '--stagger-delay': delay,
      '--tilt-x': tilt.y * 12 + 'deg',
      '--tilt-y': -tilt.x * 12 + 'deg'
    }"
    @mousemove="onMouseMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- 骨架屏（直角矩形 + shimmer 渐变动画） -->
    <div v-if="!loaded" class="photo-card__skeleton" aria-hidden="true"></div>

    <!-- 真实图片（瓦片铺开动画） -->
    <img
      v-if="!failed"
      class="photo-card__img"
      :src="item.src"
      :alt="item.alt"
      loading="lazy"
      decoding="async"
      @load="onLoad"
      @error="onError"
    />

    <!-- 失败占位 -->
    <div v-else class="photo-card__error" aria-hidden="true">图片加载失败</div>

    <!-- 拾起时的高光层 -->
    <div class="photo-card__sheen" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.photo-card {
  position: relative;
  overflow: hidden;
  background: var(--c-mist);
  cursor: pointer;
  /* 入场起始状态 */
  opacity: 0;
  transform: scale(0.96);
  /* 3D 拾起环境 + 平滑过渡（入场期间过渡由动画接管） */
  transform-style: preserve-3d;
  perspective: 1000px;
  transform-origin: center center;
  /* hover 状态下的 transform/shadow 过渡 */
  transition:
    transform 0.4s cubic-bezier(0.2, 0.85, 0.3, 1.15),
    box-shadow 0.4s cubic-bezier(0.2, 0.85, 0.3, 1.15);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  will-change: transform, box-shadow;
}

/* 入场铺开动画：仅动 opacity，transform 留给 hover 状态 */
.photo-card.is-loaded {
  animation: fadeIn 0.5s var(--ease-out) forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

/* 拾起状态：3D 倾斜 + 微微变大 + 强投影 */
.photo-card.is-hovered {
  transform:
    translateZ(20px)
    rotateX(var(--tilt-x))
    rotateY(var(--tilt-y))
    scale(1.06);
  box-shadow:
    0 14px 28px -10px rgba(0, 0, 0, 0.28),
    0 28px 56px -14px rgba(0, 0, 0, 0.18);
  z-index: 10;
}

/* 高光层：模拟光从上方斜照到被抬起的纸面 */
.photo-card__sheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(
    115deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0) 35%,
    rgba(0, 0, 0, 0.08) 100%
  );
  mix-blend-mode: overlay;
}

.photo-card.is-hovered .photo-card__sheen {
  opacity: 1;
}

.photo-card__skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--c-shimmer-from) 0%,
    var(--c-shimmer-to) 50%,
    var(--c-shimmer-from) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}

.photo-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.photo-card__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  color: var(--c-mid);
  background: var(--c-mist);
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 尊重无障碍偏好 */
@media (prefers-reduced-motion: reduce) {
  .photo-card {
    opacity: 1;
    transform: none;
    animation: none !important;
    box-shadow: none;
  }
  .photo-card.is-hovered,
  .photo-card:hover {
    transform: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }
  .photo-card__sheen {
    display: none;
  }
  .photo-card__skeleton {
    animation: none;
  }
}
</style>