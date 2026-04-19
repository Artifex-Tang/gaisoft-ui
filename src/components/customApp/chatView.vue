<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { ElPopover, ElButton } from 'element-plus';
import { useRouter, useRoute } from "vue-router"
import { fa } from "element-plus/es/locales.mjs";
import common from "@/utils/common.js";
const router = useRouter();


// let baseUrl = import.meta.env.VITE_APP_BASE_API
// let ragFlowUrl = import.meta.env.VITE_APP_RagFlow_API
let baseUrl = common.baseUrl //import.meta.env.VITE_APP_BASE_API
let ragFlowUrl =common.ragFlowUrl// //import.meta.env.VITE_APP_RagFlow_API
// 存储动态创建的组件实例
const dynamicComponents = ref([]);
let resultBox = ref(null)


const props = defineProps({
    // 组件名称
    htmlStr: {
        type: String,
        required: true
    },
    // 组件参数
    reference: {
        type: Object,
        required: true,
        default: () => ({})
    },
    done: {
        type: Boolean,
        required: true,
        default: false
    },
    clickImgFn:{
        type: Function,
        required: true,
    },
    clickFileFn:{
        type: Function,
        required: true,
    }
})

// watch(() => props.htmlStr, (newVal, oldVal) => {
//     console.log('变化了')
    

// });
watch(() => props.done, (newVal, oldVal) => {
    if (newVal) {
        console.log('数据渲染完毕')
        console.log('最终html',props.htmlStr)
        nextTick(() => {
            handleDynamicComponents(resultBox,dynamicComponents,props.reference,props.clickImgFn,props.clickFileFn)
        })
    }
})

if(props.done){
    nextTick(() => {
            handleDynamicComponents(resultBox,dynamicComponents,props.reference,props.clickImgFn,props.clickFileFn)
        })
}





// 创建 Popover 组件
let createPopover = (id, element, reference, clickImgFn, clickFileFn) => {
    const placeholder = document.createElement('span');
    placeholder.className = 'popover-placeholder';

    console.log('图片地址', `${ragFlowUrl}/v1/document/image/${reference?.chunks[id]?.image_id}` )
    const popover = h(ElPopover, {
        placement: 'top',
        width: '680',
        trigger: 'hover',
        //content: id,//getPopoverContent(id)
    }, {
        reference: () => h('img', {
            src: '/imgs/markLogo.png',
            class: 'markPoint',
            style: 'width:16px;height:16px;cursor:pointer;',
            dataid: "${p1}"
        }, ''),
        default: () => h('div', {
            class: 'preveiwBox',
            style: " display: flex; box-sizing: border-box; padding: 10px;",
            // onClick:(event)=>fn(event,id)
        },
            h('div', { style: 'width: 20%;cursor: pointer;', onClick: (event) => clickImgFn(`${ragFlowUrl}/v1/document/image/${reference?.chunks[id]?.image_id || ''}`) },
                h('img', { src: `${ragFlowUrl}/v1/document/image/${reference?.chunks[id]?.image_id || ''}`, style: 'display: block;width: 40%;height: auto;margin:0 auto' })),
            h('div', { style: 'width: 70%' },
                h("p", { style: 'font-size: 14px;line-height: 20px;' }, reference?.chunks[id]?.content),
                h('div', { class: 'fileBox', style: 'cursor: pointer;;margin-top: 20px; display: flex;align-items: center;justify-content: flex-start;' },
                    h('p', { class: 'fileName', style: 'font-size: 14px;color:#0f4faa;margin-left: 10px;width: 100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;', onClick: (event) => clickFileFn(reference?.chunks[id]) },
                        reference?.chunks[id]?.document_name)
                )
            )

        )
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
}

// 处理动态组件
let handleDynamicComponents = (containerRef, dynamicComponents, reference, clickImgFn, clickFileFn) => {
    // 清理旧的组件
    dynamicComponents.value.forEach(({ app }) => app.unmount());
    dynamicComponents.value = [];

    if (!containerRef.value) return;

    // 查找所有占位元素
    const placeholders = containerRef.value.querySelectorAll('.popover-placeholder');

    placeholders.forEach(el => {
        const id = el.dataset.id;
        if (id) {
            const component = createPopover(parseInt(id), el, reference, clickImgFn, clickFileFn);
            dynamicComponents.value.push(component);
        }
    });
}

onMounted(() => {
    // 动态创建组件
})
</script>

<template>
    <div class='faultTracingComRoot'>
        <div class="resultContent" v-html="htmlStr" ref="resultBox"></div>
    </div>
</template>

<style lang="scss" scoped>
.faultTracingComRoot {
    font-size: 15px;
    box-sizing: border-box;
    padding: 20px;
    width: 100%;
    // max-height: 500px;
    height: fit-content;
}
</style>