<template>
  <div ref="containerRef" v-html="processedHtml"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { ElPopover, ElButton } from 'element-plus';

// 示例数据 - 实际应从远程获取
const rawHtml = ref(`
  <p>这是一个示例文本 ##1$$ 包含特殊标记</p>
  <div>第二个标记出现在这里: ##2$$。</div>
  <ul>
    <li>列表项 1</li>
    <li>列表项 ##3$$ 带标记</li>
  </ul>
`);

// 处理后的 HTML（特殊标记替换为占位符）
const processedHtml = ref('');
// 容器引用
const containerRef = ref(null);
// 存储动态创建的组件实例
const dynamicComponents = ref([]);

// 根据 ID 获取提示内容（实际业务中可能从 API 获取）
const getPopoverContent = (id) => {
  const contentMap = {
    1: '这是 ID 1 的详细说明内容',
    2: 'ID 2 的额外信息展示在这里',
    3: '第三个标记的提示内容',
    4: '第四个标记的提示信息',
    5: '第五个标记的相关说明'
  };
  return contentMap[id] || `默认提示内容 (ID: ${id})`;
};

// 预处理 HTML：将特殊标记替换为占位元素
const processHtml = (html) => {
  return html.replace(/##(\d+)\$\$/g, (_, id) => 
    `<span class="popover-placeholder" data-id="${id}"></span>`
  );
};

// 创建 Popover 组件
const createPopover = (id, element) => {
  const placeholder = document.createElement('span');
  placeholder.className = 'popover-placeholder';
  
  const popover = h(ElPopover, {
    placement: 'top',
    width: '200',
    trigger: 'hover',
    content: getPopoverContent(id)
  }, {
    reference: () => h(ElButton, { 
      type: 'primary', 
      size: 'small'
    }, `查看 ${id}`)
  });

  // 渲染 Popover 到占位元素
  const app = createApp({
    render: () => popover
  });
  
  // 使用 Element Plus 组件
  app.use(ElPopover);
  app.use(ElButton);
  
  const instance = app.mount(placeholder);
  element.parentNode.replaceChild(placeholder, element);
  
  return { app, instance, placeholder };
};

// 处理动态组件
const handleDynamicComponents = () => {
  // 清理旧的组件
  dynamicComponents.value.forEach(({ app }) => app.unmount());
  dynamicComponents.value = [];

  if (!containerRef.value) return;

  // 查找所有占位元素
  const placeholders = containerRef.value.querySelectorAll('.popover-placeholder');
  
  placeholders.forEach(el => {
    const id = el.dataset.id;
    if (id) {
      const component = createPopover(parseInt(id), el);
      dynamicComponents.value.push(component);
    }
  });
};

// 监听原始 HTML 变化
watch(rawHtml, (newVal) => {
  processedHtml.value = processHtml(newVal);
  nextTick(handleDynamicComponents);
});

// 初始化处理
processedHtml.value = processHtml(rawHtml.value);

// 生命周期钩子
onMounted(() => {
  nextTick(handleDynamicComponents);
});

onBeforeUnmount(() => {
  // 清理所有动态组件
  dynamicComponents.value.forEach(({ app }) => app.unmount());
});
</script>

<style scoped>
/* 确保容器样式正常 */
.popover-placeholder {
  display: inline-block;
  margin: 0 2px;
}
</style>