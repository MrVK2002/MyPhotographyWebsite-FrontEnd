<script setup>
import { ref, reactive } from 'vue'

/**
 * Guestbook 留言簿视图
 * - 便签风格展示（参考便签纸样式）
 * - 每张便签显示一条用户留言
 * - 顶部"留下便签"按钮 → 内联表单
 */

function pickColor() {
  return '#fdfbf7'
}

function makeNote({ name, date, body }) {
  return {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    date,
    body,
    color: pickColor()
  }
}

const SEED_NOTES = [
  { name: 'Iris Wen', date: '2025.05.12', body: '夜街那组太有氛围感了，霓虹路口简直像一部王家卫。' },
  { name: 'Marco V.', date: '2025.05.09', body: '海雾那张在 100% 显示下细节惊人。一直在猜是降噪前的 raw。' },
  { name: '屿墙的猫', date: '2025.04.28', body: '街拍系列像是把上海折叠成了一张明信片。已收藏。' },
  { name: '胶片偏执者', date: '2025.04.21', body: '颗粒残像这一档我盯了很久，想问下 Tri-X 推到多少？谢谢。' },
  { name: '夜行者', date: '2025.04.14', body: '峡湾之晨的色温控制得太冷静了。推荐用做屏保。' },
  { name: 'Hannah L.', date: '2025.03.30', body: '留言墙能换便签颜色这件事，小孩很开心。' },
  { name: '阿松', date: '2025.03.22', body: '下一辑能不能去拍一次舟山？想去那边很久了。' },
  { name: '陆也', date: '2025.03.15', body: '主页大图裁剪到 30% 顶部很聪明，眼睛一下就到位。' },
  { name: '栗子茶', date: '2025.03.08', body: '雨天那组让我想学摄影，虽然大概会三天打鱼。' }
]

const notes = ref(SEED_NOTES.map(makeNote))

// 顶部表单
const formOpen = ref(false)
const draft = reactive({ name: '', body: '' })
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
    date: `${yyyy}.${mm}.${dd}`
  })
  notes.value = [newNote, ...notes.value]
  draft.name = ''
  draft.body = ''
  errors.name = ''
  errors.body = ''
  formOpen.value = false
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

    <!-- 便签网格 -->
    <div class="guestbook__notes-grid">
      <article
        v-for="(note, index) in notes"
        :key="note.id"
        class="note-card"
        :class="`note-card--${(index % 6) + 1}`"
        :style="{
          '--note-bg': note.color,
          '--delay': `${(index % 5) * 0.15}s`
        }"
      >
        <!-- 装饰元素 -->
        <svg class="note-doodle note-doodle--star" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z"></path>
        </svg>
        <svg class="note-doodle note-doodle--sparkle" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C12 6.6 17.4 12 24 12C17.4 12 12 17.4 12 24C12 17.4 6.6 12 0 12C6.6 12 12 6.6 12 0Z"></path>
        </svg>
        <svg class="note-doodle note-doodle--swirl" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C72.1 90 90 72.1 90 50C90 32.3 75.7 18 58 18C44.3 18 33 29.3 33 43C33 53.5 41.5 62 52 62C59.7 62 66 55.7 66 48"></path>
        </svg>

        <!-- 便签内容 -->
        <header class="note-card__header">
          <span class="note-card__name">{{ note.name }}</span>
        </header>

        <p class="note-card__body">{{ note.body }}</p>

        <footer class="note-card__footer">
          <span class="note-card__date">{{ note.date }}</span>
        </footer>

        <!-- 装饰胶带 -->
        <div class="note-card__tape" aria-hidden="true"></div>
      </article>
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
   便签网格布局
==================================================================== */
.guestbook__notes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: var(--space-4) var(--space-3);
  margin-left: calc(var(--space-3) * -1);
  margin-right: calc(var(--space-3) * -1);
}

/* 每行错位布局 */
.guestbook__notes-grid .note-card:nth-child(4n+1) {
  margin-top: 0;
}
.guestbook__notes-grid .note-card:nth-child(4n+2) {
  margin-top: 1.5em;
}
.guestbook__notes-grid .note-card:nth-child(4n+3) {
  margin-top: 0.8em;
}
.guestbook__notes-grid .note-card:nth-child(4n) {
  margin-top: 2em;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .guestbook__notes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .guestbook__notes-grid .note-card:nth-child(3n+1) {
    margin-top: 0;
  }
  .guestbook__notes-grid .note-card:nth-child(3n+2) {
    margin-top: 1.5em;
  }
  .guestbook__notes-grid .note-card:nth-child(3n) {
    margin-top: 0.8em;
  }
}

@media (max-width: 900px) {
  .guestbook__notes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .guestbook__notes-grid .note-card:nth-child(2n+1) {
    margin-top: 0;
  }
  .guestbook__notes-grid .note-card:nth-child(2n) {
    margin-top: 1.5em;
  }
}

/* ====================================================================
   便签卡片样式
==================================================================== */
.note-card {
  /* 便签配色 */
  --ink-color: #2c2c2c;
  --paper-line: #e6e0d4;
  --tape-color: rgba(255, 221, 161, 0.85);
  --accent-coral: #ff8ba7;
  --accent-mint: #c6e377;
  --accent-lavender: #c0bbfe;
  --accent-yellow: #ffdf6c;
  --bg-color: var(--note-bg);

  position: relative;
  background:
    linear-gradient(var(--bg-color) 1.5em, transparent 1.5em) 0 0 / 100% 1.6em,
    linear-gradient(var(--paper-line) 0.08em, transparent 0.08em) 0 1.5em / 100% 1.6em var(--bg-color);
  border: 0.25em solid var(--ink-color);
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  box-shadow:
    0.5em 0.5em 0 var(--ink-color),
    inset 0 0 1.2em rgba(0, 0, 0, 0.03);
  padding: 3em 1.5em 2em;
  aspect-ratio: unset;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition:
    transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 0.4s ease,
    border-radius 0.4s ease;
  animation: noteFloat 6s ease-in-out infinite;
  animation-delay: var(--delay);
  z-index: 1;
}

/* 胶带装饰 */
.note-card__tape {
  position: absolute;
  top: -0.7em;
  left: 50%;
  transform: translateX(-50%) rotate(-4deg);
  width: 5em;
  height: 1.4em;
  background: var(--tape-color);
  border: 0.1em solid rgba(0, 0, 0, 0.1);
  box-shadow: 0.1em 0.1em 0.2em rgba(0, 0, 0, 0.1);
  border-radius: 2px 4px 2px 5px;
  z-index: 10;
  animation: tapeFlutter 4s infinite alternate ease-in-out;
}

/* 悬停效果 */
.note-card:hover {
  transform: translateY(-0.5em) rotate(calc(var(--rotate) + 1deg));
  box-shadow:
    0.6em 0.6em 0 var(--ink-color),
    inset 0 0 1em rgba(0, 0, 0, 0.03);
  z-index: 10;
}

/* 装饰图案 */
.note-doodle {
  position: absolute;
  fill: none;
  stroke: var(--ink-color);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  z-index: 0;
  pointer-events: none;
}

.note-doodle--star {
  width: 1.8em;
  height: 1.8em;
  top: 1.5em;
  right: 1.5em;
  fill: var(--accent-yellow);
  animation: pulseSparkle 3s infinite alternate ease-in-out;
}

.note-doodle--sparkle {
  width: 1.5em;
  height: 1.5em;
  top: 13em;
  left: 1.5em;
  fill: var(--accent-mint);
  animation: pulseSparkle 2.5s infinite alternate-reverse ease-in-out;
}

.note-doodle--swirl {
  width: 2.5em;
  height: 2.5em;
  bottom: 2em;
  right: 1em;
  stroke: var(--accent-lavender);
  stroke-width: 6;
  opacity: 0.6;
  animation: rotateDoodle 15s linear infinite;
}

/* 便签头部 */
.note-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 2;
}

.note-card__name {
  font-family: 'XianSheng-GaiZenMeChengNi-2', var(--font-elegance);
  font-size: 1.3em;
  font-weight: 900;
  color: var(--ink-color);
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.note-card__date {
  font-family: 'XianSheng-GaiZenMeChengNi-2', var(--font-elegance);
  font-size: 11px;
  color: black;
  font-weight: bolder;
  letter-spacing: 0.06em;
  margin-right: 30px;
  margin-bottom: 8px;
}

.note-card__body {
  flex: 1;
  margin: 0;
  padding: 8px 0 0;
  font-family: 'XianSheng-GaiZenMeChengNi-2', var(--font-elegance);
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink-color);
  word-break: break-word;
  position: relative;
  z-index: 2;
  width: 100%;
}

.note-card__footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  position: relative;
  z-index: 2;
}

.note-card__date {
  font-family: 'XianSheng-GaiZenMeChengNi-2', var(--font-elegance);
  font-size: 11px;
  color: black;
  font-weight: bolder;
  letter-spacing: 0.06em;
}

/* ====================================================================
   便签动画
==================================================================== */
@keyframes noteFloat {
  0%, 100% {
    transform: translateY(0) rotate(var(--rotate));
  }
  50% {
    transform: translateY(-0.4em) rotate(var(--rotate));
  }
}

@keyframes tapeFlutter {
  0% {
    transform: translateX(-50%) rotate(-4deg) scale(1);
  }
  100% {
    transform: translateX(-50%) rotate(-2deg) scale(1.02);
  }
}

@keyframes pulseSparkle {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes rotateDoodle {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ====================================================================
   响应式布局
==================================================================== */
@media (max-width: 480px) {
  .guestbook__notes-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: var(--space-4) 0;
    margin-left: 0;
    margin-right: 0;
  }

  .guestbook__notes-grid .note-card:nth-child(n) {
    margin-top: 0;
    margin-bottom: 1em;
  }
}

/* ====================================================================
   减弱动效:用户偏好 prefers-reduced-motion
==================================================================== */
@media (prefers-reduced-motion: reduce) {
  .guestbook__form {
    animation: none !important;
    transition: none !important;
  }

  .note-card {
    animation: none !important;
  }

  .note-card__tape {
    animation: none !important;
  }

  .note-doodle {
    animation: none !important;
  }
}
</style>
