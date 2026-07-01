<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const sectionRef = ref(null)
const titleRef = ref(null)
const descRef = ref(null)
const ctaRef = ref(null)
const contactRef = ref(null)
const imageRef = ref(null)

/**
 * 入场动画策略
 * ------------------------------------------------------------
 * 1. 用 gsap.set() 同步把动画目标设为初始态（opacity:0 / y/skewX 偏移），
 *    完全接管入场态，避免依赖 CSS 默认值。
 * 2. IntersectionObserver：只有当 section 进入视口时才播放动画，
 *    防止 SSR / HMR 快速切换分类时出现"瞬移到 0 再弹回"的突兀感。
 * 3. 动画结束后用 clearProps:'all' 清除 GSAP 内联样式，
 *    把元素交还给 CSS，保证 hover / focus 状态正常工作。
 * 4. prefers-reduced-motion:reduce 用户直接显示终态，不播动画。
 * 5. 进入视口前元素保持初始态；离开并再次进入时不会重新播放
 *    （一次性入场，符合杂志式排版的语义）。
 */
onMounted(() => {
  const reduceMotion =
    globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  // ---- 1. 收集所有需要入场动画的目标 ----
  const titleLines = titleRef.value?.querySelectorAll('.contact-title__line') ?? []
  const infoLines = contactRef.value?.querySelectorAll('.contact-info__line') ?? []
  const targets = [
    ...titleLines,
    descRef.value,
    ctaRef.value,
    ...infoLines,
    imageRef.value
  ].filter(Boolean)

  if (reduceMotion) {
    // 减少动效偏好：直接显示终态
    gsap.set(targets, { clearProps: 'all' })
    return
  }

  // ---- 2. 同步设初始态（避免任何一帧的"已显示"泄漏） ----
  // 注意：imageRef 不在这里接管 —— 它是远程 preload 资源，
  // 走纯 CSS 的 contact-photo-fade-in 动画，与 IntersectionObserver 解耦，
  // 这样图片可以"最先出来"，不被 timeline 阻塞。
  gsap.set(titleLines, { y: 28, skewX: 3, opacity: 0 })
  gsap.set(descRef.value, { y: 14, opacity: 0 })
  gsap.set(ctaRef.value, { y: 10, opacity: 0 })
  gsap.set(infoLines, { y: 12, opacity: 0 })

  // 图片保底：万一 preload 失败/很慢，图片也至少可见
  if (imageRef.value) {
    gsap.set(imageRef.value, { clearProps: 'all' })
  }

  // ---- 3. 用 IntersectionObserver 在元素进入视口时启动 timeline ----
  const play = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

    tl.to(titleLines, {
      y: 0,
      skewX: 0,
      opacity: 1,
      duration: 1.1,
      stagger: 0.15
    })
      .to(
        descRef.value,
        { y: 0, opacity: 1, duration: 0.85, ease: 'power2.out' },
        '-=0.75'
      )
      .to(
        ctaRef.value,
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        '-=0.5'
      )
      .to(
        infoLines,
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
        '-=0.3'
      )

    // 动画结束兜底：清除所有 inline 样式，让 hover/transition 走 CSS
    tl.eventCallback('onComplete', () => {
      gsap.set([...titleLines, descRef.value, ctaRef.value, ...infoLines], {
        clearProps: 'all'
      })
    })

    observer.disconnect()
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) play()
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  )
  observer.observe(sectionRef.value)
})
</script>

<template>
  <section ref="sectionRef" class="contact" aria-label="联系我们">
    <!-- 左侧：文字区域 -->
    <div class="contact__copy">
      <h1 ref="titleRef" class="contact-title">
        <span class="contact-title__line">Stay</span>
        <span class="contact-title__line">Connected</span>
      </h1>

      <p ref="descRef" class="contact-desc">
        Lorem ipsum dolor sit amet consectetur. Amet vel placerat ultrices viverra.
        Pellentesque pulvinar massa risus odio nibh. Nulla at mauris euismod
        placerat.
      </p>

      <a
        ref="ctaRef"
        href="mailto:hi@shadcnblocks.com"
        class="contact-cta"
        aria-label="通过邮件联系"
      >
        <span class="contact-cta__arrow" aria-hidden="true">↪</span>
        <span class="contact-cta__text">Get in touch</span>
      </a>

      <div ref="contactRef" class="contact-info">
        <a class="contact-info__line" href="tel:+10023124123">+1 (002) 312 4123</a>
        <a class="contact-info__line" href="mailto:hi@shadcnblocks.com">hi@shadcnblocks.com</a>
      </div>
    </div>

    <!-- 右侧：办公桌 / 工作室氛围图（远程 Unsplash 图源，cover + center 裁切，首屏最高优先级加载） -->
    <div ref="imageRef" class="contact__image">
      <img
        class="contact__image-photo"
        src="https://images.unsplash.com/photo-1764755932155-dabbee87df7e?auto=format&fit=crop&w=1600&h=2000&q=80"
        alt="Minimal workspace with a laptop on a clean desk, soft natural sunlight casting geometric shadows on the wall"
        width="1600"
        height="2000"
        fetchpriority="high"
        decoding="sync"
      />
    </div>
  </section>
</template>

<style scoped>
.contact {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  width: 100%;
  height: calc(100vh - var(--space-5) * 2);
  min-height: 640px;
  background: var(--c-bone);
  overflow: hidden;
}

/* ============== 左侧文字区域 ============== */
.contact__copy {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 25% 8% 8% 12%;
  background: var(--c-bone);
}

.contact-title {
  margin: 0;
  font-family: var(--font-body);
  font-size: clamp(48px, 6vw, 76px);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.03em;
  color: var(--c-ink);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-title__line {
  display: block;
  /* skewX 从左侧锚点斜切，配合 GSAP skewX: 3 入场动效 */
  transform-origin: left center;
}

.contact-desc {
  margin: 44px 0 0;
  max-width: 460px;
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--c-mid);
  letter-spacing: 0.005em;
}

.contact-cta {
  margin-top: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 500;
  color: var(--c-ink);
  text-decoration: none;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: opacity var(--t-base) var(--ease-out),
              transform var(--t-base) var(--ease-out);
  width: max-content;
  /* 入场态由 GSAP 接管：IntersectionObserver 触发后从 opacity:0 → 1 */
}

.contact-cta:hover {
  opacity: 0.7;
}

.contact-cta:active {
  transform: translateY(1px);
}

.contact-cta__arrow {
  display: inline-block;
  font-size: 20px;
  line-height: 1;
  transform: translateY(1px);
}

.contact-cta__text {
  letter-spacing: -0.005em;
}

/* 左下角联系方式 */
.contact-info {
  position: absolute;
  top: 70%;
  left: 12%;
  bottom: 18%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-info__line {
  display: block;
  font-family: var(--font-body);
  font-size: clamp(22px, 2vw, 28px);
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--c-ink);
  text-decoration: none;
  transition: opacity var(--t-base) var(--ease-out);
}

.contact-info__line:hover {
  opacity: 0.65;
}

/* ============== 右侧图片区域 ============== */
.contact__image {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* 占位底色：图片加载前不会闪一面白底，与页面整体暖灰调融合 */
  background: #d9d9d6;
}

.contact__image-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  /* 占位底色：图片加载完成前维持暖灰，与页面整体色调融合 */
  background: #d9d9d6;
  /*
   * 首屏关键图：preload + sync decoding 让图片几乎立即可见，
   * 因此这里只用一个 0.15s 的轻微 scale 入场，**不引入 opacity:0**，
   * 避免任何一帧的图片空白/延迟感。
   */
  animation: contact-photo-zoom-in 0.15s var(--ease-out, ease-out) both;
}

@keyframes contact-photo-zoom-in {
  from {
    transform: scale(1.005);
  }
  to {
    transform: scale(1);
  }
}

/* ============== 响应式 ============== */
@media (max-width: 960px) {
  .contact {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
  }

  .contact__copy {
    padding: 56px 32px;
  }

  .contact-info {
    position: static;
    margin-top: 48px;
  }

  .contact__image {
    height: 60vh;
    min-height: 420px;
  }
}
</style>