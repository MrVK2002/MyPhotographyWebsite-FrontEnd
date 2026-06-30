<script setup>
import { ref, reactive } from 'vue'

/**
 * Guestbook 留言簿视图
 * - 简洁空白风格展示
 * - 清晰展示每条留言信息
 */

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

const notes = ref([...SEED_NOTES])

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
  const newNote = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: draft.name.trim(),
    body: draft.body.trim(),
    date: `${yyyy}.${mm}.${dd}`
  }
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

    <!-- 留言列表 -->
    <div class="guestbook__list">
      <article
        v-for="note in notes"
        :key="note.id"
        class="guestbook-item"
      >
        <header class="guestbook-item__header">
          <span class="guestbook-item__name">{{ note.name }}</span>
          <time class="guestbook-item__date">{{ note.date }}</time>
        </header>
        <p class="guestbook-item__body">{{ note.body }}</p>
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
   留言列表
==================================================================== */
.guestbook__list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.guestbook-item {
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--c-mist);
}

.guestbook-item:last-child {
  border-bottom: none;
}

.guestbook-item__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.guestbook-item__name {
  font-family: var(--font-hans);
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--c-ink);
  letter-spacing: 0.05em;
}

.guestbook-item__date {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--c-mid);
  letter-spacing: 0.06em;
}

.guestbook-item__body {
  margin: 0;
  font-family: var(--font-hans);
  font-size: var(--fs-base);
  line-height: 1.7;
  color: var(--c-ink);
  word-break: break-word;
}

/* ====================================================================
   响应式布局
==================================================================== */
@media (max-width: 480px) {
  .guestbook__top {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .guestbook-item__header {
    flex-direction: column;
    gap: var(--space-1);
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
}
</style>
