<template>
  <div ref="container" class="html-with-popover"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, getCurrentInstance } from 'vue';
import { ElPopover } from 'element-plus';
import { h, render } from 'vue';

// 获取当前组件实例用于调试
const instance = getCurrentInstance();

const props = defineProps({
  html: {
    type: String,
    required: true,
    default: ''
  },
  trigger: {
    type: String,
    default: 'hover',
    validator: (value) => ['click', 'hover', 'focus', 'manual'].includes(value)
  },
  placement: {
    type: String,
    default: 'top',
    validator: (value) => [
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end'
    ].includes(value)
  },
  triggerClass: {
    type: String,
    default: 'custom-mark-point'
  }
});

const container = ref(null);

// 验证Element Plus组件是否可用
const checkElementPlus = () => {
  if (!ElPopover) {
    console.error('ElPopover组件未正确导入，请检查Element Plus的导入配置');
    return false;
  }
  return true;
};

// 处理HTML并替换元素的方法
const processHtml = async () => {
  // 检查Element Plus组件是否可用
  if (!checkElementPlus()) return;
  
  if (!container.value || !props.html) {
    console.warn('容器不存在或HTML内容为空，无法处理');
    return;
  }
  
  try {
    // 清空容器
    container.value.innerHTML = '';
    
    // 先渲染原始HTML
    container.value.innerHTML = props.html;
    
    // 等待DOM更新
    await nextTick();
    
    // 查找所有需要替换的元素
    const markPoints = container.value.querySelectorAll('.markPoint');
    
    if (markPoints.length === 0) {
      console.log('未找到class为markPoint的元素');
      return;
    }
    
    // 转换为数组处理，避免实时DOM变化导致的问题
    Array.from(markPoints).forEach((markPoint, index) => {
      try {
        // 调试信息
        console.log(`处理第${index + 1}个markPoint元素:`, markPoint);
        
        // 获取原始元素的属性和内容
        const content = markPoint.getAttribute('data-content') || '无内容';
        const text = markPoint.textContent;
        const originalClass = markPoint.getAttribute('class') || '';
        
        // 创建触发元素
        const triggerElement = h(
          'span', 
          { 
            class: `${props.triggerClass} ${originalClass.replace('markPoint', '').trim()}`,
            style: { color: '#409eff', textDecoration: 'underline', cursor: 'pointer' }
          }, 
          text
        );
        
        // 创建内容元素
        const contentElement = h('div', {
          innerHTML: content
        });
        
        // 创建el-popover组件 - 使用更简单的写法
        const popoverVNode = h(
          ElPopover,
          {
            trigger: props.trigger,
            placement: props.placement,
            // 为每个popover添加唯一标识便于调试
            id: `custom-popover-${Date.now()}-${index}`,
            // 设置容器为当前组件的容器，确保样式正确
            appendTo: container.value
          },
          {
            default: () => triggerElement,
            content: () => contentElement
          }
        );
        
        // 关键修复：设置虚拟节点的上下文为当前组件实例
        if (instance) {
          popoverVNode.appContext = instance.appContext;
        }
        
        // 创建容器并渲染组件
        const popoverContainer = document.createElement('div');
        
        // 清除可能的旧渲染
        render(null, popoverContainer);
        
        // 渲染新组件
        render(popoverVNode, popoverContainer);
        
        // 确保我们得到了有效的DOM节点
        const popoverElement = popoverContainer.firstElementChild;
        
        if (popoverElement) {
          console.log(`成功创建popover元素:`, popoverElement);
          
          if (markPoint.parentNode) {
            // 执行替换
            markPoint.parentNode.replaceChild(popoverElement, markPoint);
          } else {
            console.warn('原始元素的父节点不存在，无法替换');
          }
        } else {
          console.error('无法创建有效的popover元素，渲染结果为空');
          // 调试：直接插入原始内容作为备用
          const fallbackElement = document.createElement('span');
          fallbackElement.className = originalClass;
          fallbackElement.textContent = text;
          markPoint.parentNode?.replaceChild(fallbackElement, markPoint);
        }
      } catch (error) {
        console.error(`处理第${index + 1}个元素时出错:`, error);
      }
    });
  } catch (error) {
    console.error('处理HTML时发生错误:', error);
  }
};

// 初始渲染
onMounted(processHtml);

// 监听HTML变化，重新处理
watch(
  () => props.html,
  () => processHtml(),
  { immediate: false }
);

// 监听配置变化，重新处理
watch(
  [() => props.trigger, () => props.placement, () => props.triggerClass],
  () => processHtml()
);
</script>

<style scoped>
.html-with-popover {
  width: 100%;
}

/* 确保样式能正确应用 */
:deep(.custom-mark-point) {
  color: #409eff;
  text-decoration: underline;
  cursor: pointer;
  margin: 0 2px;
}
</style>
