<template>
  <div class="pdf-highlighter">
    <!-- 控制栏 -->
    <div class="controls">
      <div class="page-nav">
        <button class="btn" @click="prevPage" :disabled="currentPage <= 1">
          <i class="fas fa-arrow-left"></i> 上一页
        </button>
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button class="btn" @click="nextPage" :disabled="currentPage >= totalPages">
          下一页 <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="zoom-controls">
        <button class="btn btn-outline" @click="zoomOut">
          <i class="fas fa-search-minus"></i> 缩小
        </button>
        <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
        <button class="btn btn-outline" @click="zoomIn">
          <i class="fas fa-search-plus"></i> 放大
        </button>
      </div>
    </div>
    
    <!-- PDF查看器 -->
    <div class="viewer-wrapper" ref="viewer">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>正在加载PDF文档...</p>
      </div>
      
      <div v-else>
        <div v-for="page in visiblePages" :key="page.pageNumber" class="pdf-page-container">
          <div class="page-number">第 {{ page.pageNumber }} 页</div>
          <canvas :id="'pdf-canvas-' + page.pageNumber" class="pdf-page"></canvas>
          <div :id="'highlight-layer-' + page.pageNumber" class="highlight-layer"></div>
        </div>
      </div>
    </div>
    
    <!-- 状态信息 -->
    <div class="status-bar">
      <p><i class="fas fa-info-circle"></i> 共 {{ hilightArr.length }} 个高亮区域</p>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

// 定义 props
const props = defineProps({
  url: {
    type: String,
    required: true
  },
  hilightArr: {
    type: Array,
    default: () => []
  },
  initialScale: {
    type: Number,
    default: 1
  }
});

// 响应式状态
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(props.initialScale);
const loading = ref(true);
const pdfDoc = shallowRef(null);
const visiblePages = ref([]);
const viewer = ref(null);
const loadingTask = shallowRef(null);
const isFirstLoad = ref(true); // 添加首次加载标志

// 设置 PDF.js worker 路径
pdfjsLib.GlobalWorkerOptions.workerSrc = window.pdfjsWorker;

// 清理资源
const cleanup = () => {
  if (loadingTask.value) {
    loadingTask.value.destroy();
    loadingTask.value = null;
  }
  
  if (pdfDoc.value) {
    pdfDoc.value.destroy();
    pdfDoc.value = null;
  }
  
  totalPages.value = 0;
  loading.value = true;
  visiblePages.value = [];
};

// 加载 PDF 文档
const loadPdf = async () => {
  cleanup();
  
  loading.value = true;
  try {
    loadingTask.value = pdfjsLib.getDocument(props.url);
    pdfDoc.value = await loadingTask.value.promise;
    totalPages.value = pdfDoc.value.numPages;
    loading.value = false;
    
    // 如果有高亮区域，定位到第一个高亮区域
    if (props.hilightArr.length > 0) {
      const firstHighlight = props.hilightArr[0];
      
      // 直接设置当前页为高亮页
      currentPage.value = firstHighlight[0];
      
      // 更新可见页面
      await updateVisiblePages();
      
      // 确保页面渲染完成后再滚动到高亮区域
      await nextTick();
      
      // 添加一点延迟确保DOM完全更新
      setTimeout(() => {
        scrollToHighlight(firstHighlight);
      }, 100);
    } else {
      await updateVisiblePages();
    }
  } catch (error) {
    if (error.name !== 'AbortException') {
      console.error('加载PDF失败:', error);
    }
    loading.value = false;
  }
};

// 渲染指定页面
const renderPage = async (pageNum) => {
  if (!pdfDoc.value) return;
  
  try {
    const page = await pdfDoc.value.getPage(pageNum);
    const canvas = document.getElementById(`pdf-canvas-${pageNum}`);
    if (!canvas) return;
    
    const viewport = page.getViewport({ scale: scale.value });
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    renderHighlights(pageNum, viewport);
  } catch (error) {
    console.error(`渲染第${pageNum}页失败:`, error);
  }
};

// 渲染高亮区域
const renderHighlights = (pageNum, viewport) => {
  const highlightLayer = document.getElementById(`highlight-layer-${pageNum}`);
  if (!highlightLayer) return;
  
  highlightLayer.style.width = `${viewport.width}px`;
  highlightLayer.style.height = `${viewport.height}px`;
  highlightLayer.innerHTML = '';
  
  const highlightsWithIndex = props.hilightArr.map((h, globalIndex) => ({ h, globalIndex }));
  const pageHighlights = highlightsWithIndex.filter(item => item.h[0] === pageNum);
  
  pageHighlights.forEach((item) => {
    const { h, globalIndex } = item;
    const [_, x, y, width, height] = h;
    const highlightDiv = document.createElement('div');
    highlightDiv.className = 'highlight';
    highlightDiv.dataset.globalIndex = globalIndex;
    highlightDiv.style.left = `${x}px`;
    highlightDiv.style.top = `${y}px`;
    highlightDiv.style.width = `${width}px`;
    highlightDiv.style.height = `${height}px`;
    highlightLayer.appendChild(highlightDiv);
  });
};

// 更新可见页面（返回 Promise）
const updateVisiblePages = async () => {
  visiblePages.value = [];
  const startPage = currentPage.value//Math.max(1, currentPage.value - 1);
  const endPage = currentPage.value//Math.min(totalPages.value, currentPage.value + 1);
  
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.value.push({ pageNumber: i });
  }
  
  await nextTick();
  const renderPromises = visiblePages.value.map(page => renderPage(page.pageNumber));
  await Promise.all(renderPromises);
};

// 翻页功能
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    updateVisiblePages();
    scrollToTop();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    updateVisiblePages();
    scrollToTop();
  }
};

// 缩放功能
const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3);
  updateVisiblePages();
};

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5);
  updateVisiblePages();
};

// 滚动到顶部
const scrollToTop = () => {
  if (viewer.value) {
    viewer.value.scrollTop = 0;
  }
};

// 滚动到指定高亮区域
const scrollToHighlight = async (highlight) => {
  if (!highlight || highlight.length < 5) return;
  
  const [pageNum] = highlight;
  if (pageNum > 0 && pageNum <= totalPages.value) {
    // 如果当前页不是高亮所在页，则跳转到该页
    if (currentPage.value !== pageNum) {
      currentPage.value = pageNum;
      await updateVisiblePages();
      await nextTick();
    }
    
    // 确保页面渲染完成后再滚动到具体位置
    setTimeout(() => {
      scrollToHighlightPosition(highlight);
    }, 100);
  }
};

// 滚动到具体高亮位置
const scrollToHighlightPosition = (highlight) => {
  const [pageNum, x, y, width, height] = highlight;
  
  // 查找该高亮区域的全局索引
  const globalIndex = props.hilightArr.findIndex(h => 
    h[0] === pageNum && 
    h[1] === x && 
    h[2] === y && 
    h[3] === width && 
    h[4] === height
  );
  
  if (globalIndex === -1) return;
  
  nextTick(() => {
    const highlightElement = document.querySelector(
      `#highlight-layer-${pageNum} .highlight[data-global-index="${globalIndex}"]`
    );
    
    if (highlightElement && viewer.value) {
      // 计算元素位置并滚动到视图中心
      const elementRect = highlightElement.getBoundingClientRect();
      const viewerRect = viewer.value.getBoundingClientRect();
      
      const targetScrollTop = viewer.value.scrollTop + 
        (elementRect.top - viewerRect.top) - 
        (viewerRect.height / 2) + 
        (elementRect.height / 2);
      
      // 平滑滚动
      viewer.value.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
      
      // 添加动画效果
      highlightElement.style.animation = 'pulse 1s';
      setTimeout(() => {
        highlightElement.style.animation = '';
      }, 1000);
    }
  });
};

// 跳转到指定页
const goToPage = async (pageNum) => {
  if (pageNum > 0 && pageNum <= totalPages.value) {
    currentPage.value = pageNum;
    await updateVisiblePages();
    scrollToTop();
  }
};

// 添加 CSS 动画
const addPulseAnimation = () => {
  if (document.getElementById('pdf-pulse-animation')) return;
  
  const style = document.createElement('style');
  style.id = 'pdf-pulse-animation';
  style.textContent = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(255, 215, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
    }
  `;
  document.head.appendChild(style);
};

// 生命周期钩子
onMounted(() => {
  addPulseAnimation();
  loadPdf();
});

onBeforeUnmount(() => {
  cleanup();
});

// 监听属性变化
watch(() => props.url, (newUrl) => {
  if (newUrl) loadPdf();
});

watch(() => props.hilightArr, (newArr) => {
  if (newArr.length > 0) {
    scrollToHighlight(newArr[0]);
  }
  updateVisiblePages();
}, { deep: true });

// 暴露方法给父组件
defineExpose({
  reloadPdf: loadPdf,
  scrollToHighlight,
  goToPage
});
</script>

<style scoped>
.pdf-highlighter {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.page-nav, .zoom-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-info, .zoom-info {
  font-size: 1.05rem;
  font-weight: 500;
  min-width: 120px;
  text-align: center;
}

.btn {
  background: linear-gradient(135deg, #4a7bff, #3a6be0);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  background: linear-gradient(135deg, #3a6be0, #2a5bc0);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid #4a7bff;
  color: #4a7bff;
}

.btn-outline:hover {
  background: rgba(74, 123, 255, 0.1);
}

.viewer-wrapper {
  position: relative;
  overflow: auto;
  flex: 1;
  background: #2c3e50;
  background-image: linear-gradient(45deg, #2c3e50 25%, transparent 25%), 
                    linear-gradient(-45deg, #2c3e50 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #2c3e50 75%),
                    linear-gradient(-45deg, transparent 75%, #2c3e50 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.pdf-page-container {
  position: relative;
  margin: 20px auto;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
}

.page-number {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  z-index: 10;
}

.pdf-page {
  display: block;
  background: white;
  margin: 0 auto;
}

.highlight-layer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.highlight {
  position: absolute;
  background: rgba(255, 215, 0, 0.4);
  border: 2px solid rgba(255, 195, 0, 0.8);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
  transition: all 0.3s;
  cursor: pointer;
}

.highlight:hover {
  background: rgba(255, 225, 0, 0.6);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #e0e0e0;
}

.loading-spinner {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid #4a7bff;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-bar {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  text-align: center;
  color: #a0a0a0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .page-nav, .zoom-controls {
    justify-content: center;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>