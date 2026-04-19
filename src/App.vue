<template>
  <router-view  :key="route.path" />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'
import { useRoute } from 'vue-router';

const route = useRoute();
onMounted(async() => {
  
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })

  

 const settingsStore = useSettingsStore();
 await settingsStore.setRagFlow_API();
})
</script>

<style>

</style>
