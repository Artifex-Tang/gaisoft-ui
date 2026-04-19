<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router"
import { Delete, Edit, Search, Share, Upload, Refresh } from '@element-plus/icons-vue'
import common from '@/utils/common.js'
import {getAssistants} from '@/api/app/ops.js'
import {getIcon} from '@/api/kb/icon.js'
const router = useRouter();


let defaultAssistantIcon="";
let loadDefaultAssistantIcon=async ()=>{
    let iconRes=await getIcon(1)
    console.log("加载助理默认图标",iconRes)
    if(iconRes.code==0){
        defaultAssistantIcon=iconRes.data.icon
    }
}

let keywords=ref("")




let init=async ()=>{
    await loadDefaultAssistantIcon();
}


onMounted(async () => {
  await init()  
})

</script>



<template>
    <div class='root'>
            <header>
                文件管理
            </header>
    </div>
</template>

<style lang="scss" scoped>

.root {
     padding: 0;
    margin: 0;
    width: 100%;
    height: calc(100vh - 84px);
    box-sizing: border-box;
    padding: 20px 10px;




}
</style>