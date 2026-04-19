<template>
  <div class="highlight-list">
    <h3>高亮区域列表</h3>
    <div class="highlight-actions">
      <button @click="addHighlight">添加高亮区域</button>
      <button @click="clearHighlights">清除所有</button>
    </div>
    <div v-if="highlights.length === 0" class="empty">暂无高亮区域</div>
    <ul v-else>
      <li v-for="(h, index) in highlights" :key="index" 
          @click="jumpToHighlight(h)"
          :class="{ active: activeIndex === index }">
        <span class="page">第 {{ h[0] }} 页</span>
        <span class="coords">({{ h[1] }}, {{ h[2] }})</span>
        <span class="size">{{ h[3] }}×{{ h[4] }}px</span>
        <button class="delete" @click.stop="removeHighlight(index)">×</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    highlights: {
      type: Array,
      default: () => []
    },
    activeIndex: Number
  },
  methods: {
    jumpToHighlight(highlight) {
      this.$emit('jump-to', highlight);
    },
    addHighlight() {
      // 随机生成一个高亮区域
      const page = Math.floor(Math.random() * 5) + 1;
      const x = Math.floor(Math.random() * 300) + 50;
      const y = Math.floor(Math.random() * 300) + 50;
      const width = Math.floor(Math.random() * 200) + 50;
      const height = Math.floor(Math.random() * 30) + 20;
      
      this.$emit('add', [page, x, y, width, height]);
    },
    removeHighlight(index) {
      this.$emit('remove', index);
    },
    clearHighlights() {
      this.$emit('clear');
    }
  }
}
</script>

<style scoped>
.highlight-list {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: 100%;
  overflow-y: auto;
}

h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.highlight-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

button {
  background: #42b983;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #3aa976;
}

.empty {
  color: #999;
  text-align: center;
  padding: 20px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  background: white;
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #42b983;
}

li:hover {
  background: #edfff8;
  transform: translateX(3px);
}

li.active {
  background: #e1f7ee;
  border-left: 4px solid #2c3e50;
}

.page {
  font-weight: bold;
  color: #2c3e50;
}

.coords {
  color: #42b983;
  font-family: monospace;
}

.size {
  color: #666;
  font-size: 0.9em;
}

.delete {
  background: #ff6b6b;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.delete:hover {
  background: #ff5252;
}
</style>