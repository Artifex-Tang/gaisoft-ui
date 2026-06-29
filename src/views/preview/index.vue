<template>
  <div class="previewWrap">
    <div class="previewHeader">
      <span class="fname">{{ name || ('document.' + ext) }}</span>
      <a class="dl" :href="fileUrl" :download="name">下载原文件</a>
    </div>
    <div class="previewBody">
      <div v-if="loading" class="hint">加载中...</div>
      <div v-else-if="error" class="hint err">{{ error }}</div>
      <iframe v-else-if="ext === 'pdf'" :src="fileUrl" class="fill"></iframe>
      <img v-else-if="isImage" :src="fileUrl" class="imgView" />
      <div v-else ref="officeRef" class="officeView"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const fileId = route.query.fileId
const ext = (route.query.ext || '').toLowerCase()
const name = route.query.name || ''

const baseUrl = import.meta.env.VITE_APP_BASE_API
// 后端 /file/doc/{id} 用 RagFlowServerBaseUrl config 构造ragflow URL + API key代理
const fileUrl = `${baseUrl}/file/doc/${fileId}?suffix=${ext}`

const isImage = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext)
const loading = ref(false)
const error = ref('')
const officeRef = ref(null)

onMounted(async () => {
  // pdf/图片: 直接用URL渲染
  if (ext === 'pdf' || isImage) return
  // 非office类: 不支持预览, 触发下载
  if (!['docx', 'doc', 'xlsx', 'xls', 'csv'].includes(ext)) {
    window.location.href = fileUrl
    return
  }
  loading.value = true
  try {
    const res = await fetch(fileUrl)
    if (!res.ok) throw new Error('文件获取失败 ' + res.status)
    const buf = await res.arrayBuffer()
    if (ext === 'docx' || ext === 'doc') {
      const { renderAsync } = await import('docx-preview')
      await nextTick()
      await renderAsync(buf, officeRef.value, null, { inWrapper: true, ignoreWidth: false, ignoreHeight: false })
    } else {
      // xlsx/xls/csv
      const XLSX = await import('xlsx')
      const wb = XLSX.read(buf, { type: 'array' })
      const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]])
      await nextTick()
      officeRef.value.innerHTML = '<table class="xlsxTbl">' + html.replace(/^<table[^>]*>|<\/table>$/g, '') + '</table>'
    }
  } catch (e) {
    error.value = '预览失败：' + (e.message || e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.previewWrap { width: 100vw; height: 100vh; display: flex; flex-direction: column; background: #fff; }
.previewHeader { height: 44px; flex: 0 0 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #eee; background: #fafafa; }
.fname { font-weight: 600; color: #333; }
.dl { color: #409EFF; text-decoration: none; }
.previewBody { flex: 1; min-height: 0; position: relative; }
.fill { width: 100%; height: 100%; border: 0; }
.imgView { max-width: 100%; max-height: 100%; display: block; margin: 0 auto; }
.officeView { width: 100%; height: 100%; overflow: auto; padding: 20px; }
.hint { padding: 40px; text-align: center; color: #999; }
.err { color: #f56c6c; }
</style>
<style>
/* xlsx 渲染的表格样式(非scoped, 因innerHTML注入) */
.xlsxTbl, .officeView table { border-collapse: collapse; width: 100%; }
.xlsxTbl td, .officeView td { border: 1px solid #ddd; padding: 4px 8px; font-size: 13px; }
</style>
