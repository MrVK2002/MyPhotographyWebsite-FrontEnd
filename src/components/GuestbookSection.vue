<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { PageFlip } from 'page-flip'

/**
 * Guestbook 留言簿视图
 * - 3D 翻页效果（使用 page-flip 库）
 * - 每一页显示一条用户留言
 * - 支持鼠标拖拽翻页和触摸翻页
 * - 顶部"留下便签"按钮 → 内联表单
 */

const PALETTE = [
  { bg: '#FFFA9E', weight: 40 }, // 明黄
  { bg: '#A8E6CF', weight: 20 }, // 淡蓝
  { bg: '#FFD3B6', weight: 20 }, // 淡粉
  { bg: '#C7F9CC', weight: 10 }, // 淡绿
  { bg: '#E0BBE4', weight: 10 }  // 淡紫
]

function pickColor() {
  const total = PALETTE.reduce((s, p) => s + p.weight, 0)
  let r = Math.random() * total
  for (const p of PALETTE) {
    r -= p.weight
    if (r <= 0) return p.bg
  }
  return PALETTE[0].bg
}

function makeNote({ name, date, body, rating }) {
  return {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    date,
    body,
    rating: rating ?? 0,
    color: pickColor()
  }
}

const SEED_NOTES = [
  { name: 'Iris Wen', date: '2025.05.12', body: '夜街那组太有氛围感了，霓虹路口简直像一部王家卫。', rating: 5 },
  { name: 'Marco V.', date: '2025.05.09', body: '海雾那张在 100% 显示下细节惊人。一直在猜是降噪前的 raw。', rating: 4 },
  { name: '屿墙的猫', date: '2025.04.28', body: '街拍系列像是把上海折叠成了一张明信片。已收藏。', rating: 5 },
  { name: '胶片偏执者', date: '2025.04.21', body: '颗粒残像这一档我盯了很久，想问下 Tri-X 推到多少？谢谢。', rating: 4 },
  { name: '夜行者', date: '2025.04.14', body: '峡湾之晨的色温控制得太冷静了。推荐用做屏保。', rating: 5 },
  { name: 'Hannah L.', date: '2025.03.30', body: '留言墙能换便签颜色这件事，小孩很开心。', rating: 4 },
  { name: '阿松', date: '2025.03.22', body: '下一辑能不能去拍一次舟山？想去那边很久了。', rating: 3 },
  { name: '陆也', date: '2025.03.15', body: '主页大图裁剪到 30% 顶部很聪明，眼睛一下就到位。', rating: 5 },
  { name: '栗子茶', date: '2025.03.08', body: '雨天那组让我想学摄影，虽然大概会三天打鱼。', rating: 4 }
]

const notes = ref(SEED_NOTES.map(makeNote))
const bookContainer = ref(null)
let pageFlip = null

// 顶部表单
const formOpen = ref(false)
const draft = reactive({ name: '', body: '', rating: 0 })
const errors = reactive({ name: '', body: '' })

function openForm() {
  formOpen.value = true
}
function closeForm() {
  formOpen.value = false
  errors.name = ''
  errors.body = ''
}

function validate() {
  errors.name = draft.name.trim() ? '' : '请输入昵称'
  errors.body = draft.body.trim() ? '' : '写点什么吧'
  return !errors.name && !errors.body
}

function submitNote() {
  if (!validate()) return
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const newNote = makeNote({
    name: draft.name.trim(),
    body: draft.body.trim(),
    date: `${yyyy}.${mm}.${dd}`,
    rating: draft.rating
  })
  notes.value = [newNote, ...notes.value]
  draft.name = ''
  draft.body = ''
  draft.rating = 0
  errors.name = ''
  errors.body = ''
  formOpen.value = false
  // 重新初始化翻页书
  initPageFlip()
}

function setRating(n) {
  draft.rating = draft.rating === n ? 0 : n
}

// 初始化翻页书
function initPageFlip() {
  if (pageFlip) {
    pageFlip.destroy()
    pageFlip = null
  }
  
  nextTick(() => {
    if (bookContainer.value) {
      pageFlip = new PageFlip(bookContainer.value, {
        width: 420,
        height: 560,
        size: 'stretch',
        minWidth: 315,
        maxWidth: 600,
        minHeight: 420,
        maxHeight: 800,
        drawShadow: true,
        flippingTime: 800,
        usePortrait: true,
        autoSize: true,
        maxShadowOpacity: 0.4,
        showCover: true,
        mobileScrollSupport: false
      })
      
      const pages = document.querySelectorAll('.guestbook-page')
      if (pages.length > 0) {
        pageFlip.loadFromHTML(Array.from(pages))
      }
    }
  })
}

onMounted(() => {
  initPageFlip()
})

onUnmounted(() => {
  if (pageFlip) {
    pageFlip.destroy()
  }
})

// 生成星星显示
function getStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <section class="guestbook" aria-label="留言簿">
    <!-- 顶部栏:标题 + 计数 + 操作 -->
    <header class="guestbook__top">
      <div class="guestbook__title-wrap">
        <h1 class="guestbook__title">留言簿</h1>
        <span class="guestbook__title-en">Guestbook</span>
        <span class="guestbook__count">{{ notes.length }} 条留言</span>
      </div>

      <div class="guestbook__actions">
        <button
          type="button"
          class="guestbook__leave-btn"
          :aria-expanded="formOpen"
          aria-controls="guestbook-form"
          @click="openForm"
        >
          <span class="guestbook__leave-btn-dot" aria-hidden="true"></span>
          留下足迹
        </button>
      </div>
    </header>

    <!-- 内联表单 -->
    <form
      v-if="formOpen"
      id="guestbook-form"
      class="guestbook__form"
      novalidate
      @submit.prevent="submitNote"
    >
      <div class="guestbook__form-row">
        <label class="guestbook__field">
          <span class="guestbook__field-label">昵称 / Nickname</span>
          <input
            v-model="draft.name"
            type="text"
            class="guestbook__input"
            :class="{ 'is-error': errors.name }"
            maxlength="32"
            autocomplete="off"
          />
          <span v-if="errors.name" class="guestbook__field-error">{{ errors.name }}</span>
        </label>

        <fieldset class="guestbook__field guestbook__stars-field">
          <legend class="guestbook__field-label">评价 / Rating (optional)</legend>
          <div class="guestbook__stars">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="guestbook__star"
              :class="{ 'is-on': draft.rating >= n }"
              :aria-pressed="draft.rating >= n"
              :aria-label="`${n} 星`"
              @click="setRating(n)"
            >★</button>
          </div>
        </fieldset>
      </div>

      <label class="guestbook__field guestbook__field--block">
        <span class="guestbook__field-label">留言 / Message</span>
        <textarea
          v-model="draft.body"
          class="guestbook__input guestbook__textarea"
          :class="{ 'is-error': errors.body }"
          rows="3"
          maxlength="280"
          placeholder="说点什么……"
        ></textarea>
        <span v-if="errors.body" class="guestbook__field-error">{{ errors.body }}</span>
      </label>

      <div class="guestbook__form-actions">
        <button type="button" class="guestbook__btn guestbook__btn--ghost" @click="closeForm">
          取消
        </button>
        <button type="submit" class="guestbook__btn guestbook__btn--solid">
          提交
        </button>
      </div>
    </form>

    <!-- 3D翻页留言簿 -->
    <div class="guestbook__book-wrapper">
      <div ref="bookContainer" class="guestbook__book">
        <!-- 封面（第一页） -->
        <div class="guestbook-page guestbook-cover stf__hard stf__item">
          <div class="cover__inner">
            <div class="cover__ornament cover__ornament--top">
              <svg viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10 Q15 0, 30 10 Q45 20, 60 10" stroke="currentColor" stroke-width="1" fill="none"/>
                <circle cx="30" cy="10" r="3" fill="currentColor"/>
              </svg>
            </div>
            <div class="cover__content">
              <h2 class="cover__title-zh">留 言 簿</h2>
              <h3 class="cover__title-en">Guestbook</h3>
              <p class="cover__subtitle">每一张照片，都是一段故事</p>
              <p class="cover__subtitle-en">Every photo tells a story</p>
            </div>
            <div class="cover__divider"></div>
            <div class="cover__meta">
              <span class="cover__count">{{ notes.length }} 条留言</span>
            </div>
            <div class="cover__ornament cover__ornament--bottom">
              <svg viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 5 L40 25 M30 15 L40 5 L50 15" stroke="currentColor" stroke-width="1" fill="none"/>
                <path d="M20 20 Q30 15, 40 20 Q50 25, 60 20" stroke="currentColor" stroke-width="0.8" fill="none"/>
              </svg>
            </div>
            <div class="cover__hint">
              <span>↓ 翻开第一页</span>
            </div>
          </div>
        </div>

        <!-- 动态渲染的页面 -->
        <div
          v-for="(note, index) in notes"
          :key="note.id"
          class="guestbook-page"
          :class="{
            'stf__item': true
          }"
          :style="{ '--paper': note.color }"
        >
          <div class="page__inner">
            <header class="page__header">
              <span class="page__name">{{ note.name }}</span>
              <span class="page__date">{{ note.date }}</span>
            </header>
            <div class="page__rating" v-if="note.rating > 0">
              <span class="page__stars">{{ getStars(note.rating) }}</span>
            </div>
            <p class="page__body">{{ note.body }}</p>
            <footer class="page__footer">
              <span class="page__number">{{ index + 1 }} / {{ notes.length }}</span>
            </footer>
          </div>
        </div>

        <!-- 封底（最后一页） -->
        <div class="guestbook-page guestbook-backcover stf__hard stf__item">
          <div class="backcover__inner">
            <div class="backcover__content">
              <div class="backcover__icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <circle cx="24" cy="24" r="12" stroke="currentColor" stroke-width="1" fill="none"/>
                  <circle cx="24" cy="24" r="4" fill="currentColor"/>
                  <path d="M24 4 L24 10 M24 38 L24 44 M4 24 L10 24 M38 24 L44 24" stroke="currentColor" stroke-width="1"/>
                </svg>
              </div>
              <p class="backcover__quote">"光影定格瞬间，留言留存温度"</p>
              <p class="backcover__thanks">感谢你的足迹</p>
              <p class="backcover__invite">期待下次相遇</p>
            </div>
            <div class="backcover__divider"></div>
            <div class="backcover__meta">
              <span class="backcover__label">JT Photography</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 提示文字 -->
      <p class="guestbook__hint">拖拽页面边缘翻页，或使用鼠标拖拽翻页</p>
    </div>
  </section>
</template>

<style scoped>
/* ====================================================================
   容器
==================================================================== */
.guestbook {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: calc(100vh - var(--space-5) * 2);
}

/* ====================================================================
   顶部栏
==================================================================== */
.guestbook__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
  padding: 0 0 var(--space-5);
  border-bottom: 1px solid var(--c-mist);
  margin-bottom: var(--space-6);
}

.guestbook__title-wrap {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.guestbook__title {
  font-family: var(--font-display);
  font-size: clamp(36px, 4.2vw, 56px);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.02em;
  color: var(--c-ink);
  margin: 0;
}

.guestbook__title-en {
  font-family: var(--font-hans);
  font-size: var(--fs-sm);
  font-weight: 400;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--c-mid);
}

.guestbook__count {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--c-mid);
  padding-left: var(--space-3);
  border-left: 1px solid var(--c-mist);
  margin-left: var(--space-2);
}

/* ====================================================================
   顶部操作按钮
==================================================================== */
.guestbook__leave-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  background: var(--c-ink);
  color: var(--c-bone);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border: 0;
  border-radius: 0;
  cursor: pointer;
  transition: background var(--t-base) var(--ease-out), transform var(--t-fast) var(--ease-out);
}

.guestbook__leave-btn:hover {
  background: #2a2a2a;
}

.guestbook__leave-btn:active {
  transform: translateY(1px);
}

.guestbook__leave-btn-dot {
  width: 6px;
  height: 6px;
  background: #d85a4a;
  display: inline-block;
}

/* ====================================================================
   内联表单
==================================================================== */
.guestbook__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
  background: var(--c-bone);
  border: 1px solid var(--c-mist);
  animation: formIn var(--t-base) var(--ease-out) both;
}

@keyframes formIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.guestbook__form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
}

@media (max-width: 700px) {
  .guestbook__form-row {
    grid-template-columns: 1fr;
  }
}

.guestbook__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.guestbook__field--block {
  display: block;
}

.guestbook__field-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--c-mid);
}

.guestbook__input {
  width: 100%;
  padding: 10px 12px;
  background: var(--c-bone);
  border: 1px solid var(--c-mist);
  border-radius: 0;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  font-weight: 400;
  color: var(--c-ink);
  outline: none;
  transition: border-color var(--t-base) var(--ease-out);
}

.guestbook__input:focus {
  border-color: var(--c-ink);
}

.guestbook__input.is-error {
  border-color: #b94740;
}

.guestbook__textarea {
  resize: vertical;
  min-height: 80px;
  font-family: var(--font-elegance);
  font-size: 15px;
  line-height: 1.6;
}

.guestbook__field-error {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #b94740;
}

.guestbook__stars-field {
  border: 0;
  padding: 0;
  margin: 0;
}

.guestbook__stars-field legend {
  padding: 0 0 6px;
  width: 100%;
}

.guestbook__stars {
  display: inline-flex;
  gap: 6px;
}

.guestbook__star {
  width: 28px;
  height: 28px;
  border: 1px solid var(--c-mist);
  background: var(--c-bone);
  color: var(--c-soft);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  transition: color var(--t-fast) var(--ease-out), border-color var(--t-fast) var(--ease-out);
}

.guestbook__star.is-on {
  color: #c89b2c;
  border-color: #c89b2c;
}

.guestbook__form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.guestbook__btn {
  padding: 10px 22px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border-radius: 0;
  cursor: pointer;
  border: 1px solid var(--c-ink);
  transition: background var(--t-fast) var(--ease-out), color var(--t-fast) var(--ease-out);
}

.guestbook__btn--solid {
  background: var(--c-ink);
  color: var(--c-bone);
}

.guestbook__btn--solid:hover {
  background: #2a2a2a;
}

.guestbook__btn--ghost {
  background: transparent;
  color: var(--c-ink);
}

.guestbook__btn--ghost:hover {
  background: var(--c-mist);
}

/* ====================================================================
   3D翻页留言簿容器
==================================================================== */
.guestbook__book-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-5) 0;
  flex: 1;
}

.guestbook__book {
  width: 100%;
  max-width: 600px;
  min-height: 420px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.guestbook__hint {
  margin-top: var(--space-4);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--c-mid);
  text-align: center;
}

/* ====================================================================
   翻页书页面样式
==================================================================== */
.guestbook-page {
  background: var(--paper, #FFFA9E);
  box-shadow: 
    2px 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 0 40px rgba(0, 0, 0, 0.03);
  border-radius: 2px;
}

.guestbook-page.stf__hard {
  background: linear-gradient(135deg, #f5f0e6 0%, #e8e0d0 100%);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.page__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 40px 32px;
  font-family: var(--font-elegance);
  color: #333333;
}

.page__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.15);
  margin-bottom: 16px;
}

.page__name {
  font-family: 'XianSheng-GaiZenMeChengNi-2', var(--font-elegance);
  font-size: 22px;
  font-weight: 400;
  color: #111111;
  letter-spacing: 0.02em;
}

.page__date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #888888;
  letter-spacing: 0.06em;
}

.page__rating {
  margin-bottom: 12px;
}

.page__stars {
  font-size: 14px;
  color: #c89b2c;
  letter-spacing: 2px;
}

.page__body {
  flex: 1;
  margin: 0;
  font-family: 'XianSheng-GaiZenMeChengNi-2', var(--font-elegance);
  font-size: 18px;
  line-height: 1.7;
  color: #333333;
  word-break: break-word;
}

.page__footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px dashed rgba(0, 0, 0, 0.15);
  margin-top: 16px;
}

.page__number {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #888888;
  letter-spacing: 0.1em;
}

/* ====================================================================
   减弱动效:用户偏好 prefers-reduced-motion
==================================================================== */
@media (prefers-reduced-motion: reduce) {
  .guestbook__form {
    animation: none !important;
    transition: none !important;
  }
}
</style>
