<script setup>
import { ref, onMounted, reactive } from "vue";
import { commonReqRagFlowServer } from "@/api/app/ops.js";
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { useRouter, useRoute } from "vue-router"
import { Delete, Edit, Search, Share, Upload, Setting, View } from '@element-plus/icons-vue'
import { modelObjMap } from "./modelMap.js";

const router = useRouter();

let addModelBoxActivenName = ref("1")
let modelToBeAddedname = ref("1")

//*********************************************************************默认模型
let defaultModelShow = ref(false)
let defaultModelObj = ref({
    "asr_id": "",
    "embd_id": "",
    "img2txt_id": "",
    "llm_id": "",
    "name": "",
    //"parser_ids": "",
    "rerank_id": "",
    //"role": "",
    "tenant_id": "",
    "tts_id": null
})
//加载默认模型数据
let loadDefaultModelObj = async () => {
    let res = await commonReqRagFlowServer("/v1/user/tenant_info", "get", null);
    ////console.log('加载默认模型',res)
    if (res.code == 0) {
        defaultModelObj.value = res.data
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }

}
//默认模型选项
let defaultChatModelOptions = []//聊天模型选项
let defaultEmbdModelOptions = []//嵌入模型选项
let defaultImg2txtModelOptions = []//图像模型选项
let defaultSpeech2txtModelOptions = []//语音模型选项
let defaultRerankModelOptions = []//排序模型选项
let defaultTTSModelOptions = []//TTS模型选项
let loadDefaultModelOptions = async () => {
    let res = await commonReqRagFlowServer("/v1/llm/list", "get", null);
    ////console.log('默认模型选项', res)
    if (res.code == 0) {
        let data = res.data
        let useData = []
        let tempPackage = [];

        let hasModelNames = addedModelList.value.map(item => item.name)
        for (let key in data) {
            if (hasModelNames.includes(key)) {
                useData = useData.concat(data[key])
            }
        }
        ////console.log('可用数据', useData)

        defaultChatModelOptions = loadDefaultModelOptionsProcess(useData, "chat")
        defaultEmbdModelOptions = loadDefaultModelOptionsProcess(useData, "embedding")
        defaultImg2txtModelOptions = loadDefaultModelOptionsProcess(useData, "image2text")
        defaultSpeech2txtModelOptions = loadDefaultModelOptionsProcess(useData, "speech2text")
        defaultRerankModelOptions = loadDefaultModelOptionsProcess(useData, "rerank")
        defaultTTSModelOptions = loadDefaultModelOptionsProcess(useData, "tts")

        // //console.log('defaultChatModelOptions',defaultChatModelOptions)
        // //console.log('defaultEmbdModelOptions',defaultEmbdModelOptions)
        // //console.log('defaultImg2txtModelOptions',defaultImg2txtModelOptions)
        // //console.log('defaultSpeech2txtModelOptions',defaultSpeech2txtModelOptions)
        // //console.log('defaultRerankModelOptions',defaultRerankModelOptions)
        // //console.log('defaultTTSModelOptions',defaultTTSModelOptions)
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }

}
let loadDefaultModelOptionsProcess = (useData, model_type) => {
    const groupedByFid = {};
    useData.forEach(item => {
        // 只处理model_type为'chat'的项
        if (item.model_type === model_type) {
            if (!groupedByFid[item.fid]) {
                groupedByFid[item.fid] = [];
            }
            groupedByFid[item.fid].push(item);
        }
    });

    // 步骤2: 转换为目标格式
    const result = Object.keys(groupedByFid).map(fid => {
        const options = groupedByFid[fid].map(item => ({
            value: `${item.llm_name}@${item.fid}`,
            label: item.llm_name,
            tags: item.tags,
            logo: `/imgs/modelLogo/${item.fid}.svg`
        }));
        return {
            label: fid,
            options
        };
    });
    ////console.log('最后转换结果', result)
    return result
}
//提交默认模型
let submitDeaultModel = async () => {
    //('提交默认模型',defaultModelObj.value)
    let submitObj = JSON.parse(JSON.stringify(defaultModelObj.value))
    delete submitObj.parser_ids
    delete submitObj.role
    let res = await commonReqRagFlowServer("/v1/user/set_tenant_info", "post", JSON.stringify(submitObj));
    if (res.code == 0) {
        ElMessage({ message: "提交成功", type: 'success', duration: 3 * 1000 })
        defaultModelShow.value = false
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }

}


//************************************************************************已添加的模型
let addedModelList = ref([])
let loadAddModelList = async () => {
    let res = await commonReqRagFlowServer("/v1/llm/my_llms", "get", null);
    //console.log('加载已添加的模型', res)
    if (res.code == 0) {
        let data = res.data
        let tempPackage = []
        for (let item in data) {
            let temp = {
                name: item,
                tags: data[item].tags,
                llm: data[item].llm,
                logo: `/imgs/modelLogo/${item}.svg`
            }
            tempPackage.push(temp)
            ////console.log(item)
        }
        addedModelList.value = tempPackage
        console.log('已添加的模型', addedModelList.value)
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }
}
let removeBigModel = async (obj) => {//移除大模型
    // //console.log('移除大模型', obj)
    let res = await commonReqRagFlowServer("/v1/llm/delete_factory", "post", JSON.stringify({ "llm_factory": obj.name }));
    if (res.code == 0) {
        ElMessage({ message: "移除成功", type: 'success', duration: 3 * 1000 })

        loadAddModelList()
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }
}
let removeSmallModel = async (obj, factory) => {//移除小模型
    ////console.log('移除小模型', obj,factory)
    let res = await commonReqRagFlowServer("/v1/llm/delete_llm", "post", JSON.stringify({ "llm_factory": factory, "llm_name": obj.name }));
    //console.log('移除小模型后返回', res)
    if (res.code == 0) {
        ElMessage({ message: "移除成功", type: 'success', duration: 3 * 1000 })
        showAllSmallModelFlag.value = false
        showAllSmallModelTitle.value = ''
        allSmallModels.value = []
        loadAddModelList()
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }

}
let editBigModel = (obj) => {//编辑大模型
    ////console.log('编辑大模型', obj)
    let model_types=obj.llm.map(item=>item.type)
    model_types=[...new Set(model_types)]
    obj['model_types']=model_types
    ////console.log('处理后数据', obj)
    addBigModel(obj)
}
let showAllSmallModelFlag = ref(false)
let showAllSmallModelTitle = ref('')
let allSmallModels = ref([])
let showAllSmallModel = (obj) => {//展示全部小模型
    showAllSmallModelFlag.value = true
    allSmallModels.value = obj.llm
    showAllSmallModelTitle.value = obj.name
    ////console.log('展示全部小模型', obj)
}


//*************************************************************************待添加的模型
let sortList=['Ollama','Xinference','VLLM','OpenAI']
let bigModelFormRef = ref(null)
let modelToBeAddedList = ref([])
let loadModelToBeAddedList = async () => {
    let res = await commonReqRagFlowServer("/v1/llm/factories", "get", null);
    //console.log('加载待添加的模型', res)
    if (res.code == 0) {
        let data = res.data
        let tempPackage = []
        for (let item of data) {
            tempPackage.push({
                name: item.name,
                status: item.status,
                tags: item.tags,
                model_types: item.model_types,
                logo: `/imgs/modelLogo/${item.name}.svg`
            })
        }

        let tempModelNameArr=addedModelList.value.map(o=>o.name)
        // //排序根据name 对应sortList中的项目
        // tempPackage.sort((a,b)=>{
        //     let aIndex=sortList.indexOf(a.name)
        //     let bIndex=sortList.indexOf(b.name)
        //     if(aIndex==-1&&bIndex==-1){
        //         return a.name.localeCompare(b.name)
        //     }
        //     else if(aIndex==-1){
        //         return 1
        //     }
        //     else if(bIndex==-1){
        //         return -1
        //     }
        // })
        //根据sortList过滤数据
        tempPackage = tempPackage.filter(o => sortList.includes(o.name))

        modelToBeAddedList.value = tempPackage.filter(o=>!tempModelNameArr.includes(o.name))
         console.log('待添加的模型', modelToBeAddedList.value)
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }
}
let addModelObj = ref({})////待添加的模型信息
let addModelMap = ref({})//待添加的模型映射配置信息
let addBigModelBoxTitle = ref('')

let addBigModelBoxFlag = ref(false)
let addBigModel = async (obj) => {//添加大模型
    //console.log('添加大模型', obj)

    let tempMap = modelObjMap.find(o => o.llm_factory == obj.name)
    if (tempMap) {

        addModelMap.value = tempMap
        addModelObj.value = tempMap.modelFileds
        addBigModelBoxTitle.value = obj.name + '(添加模型)'
        addBigModelBoxFlag.value = true

        //修改表单可选项 fieldsOptions
        let fieldsOptionsItem = addModelMap.value.fieldsOptions.find(o => o.prop == 'model_type')
        if (fieldsOptionsItem) {
            fieldsOptionsItem['options'] = obj.model_types.map(o=>{return {label:o,value:o}});
        }

        //console.log('addModelMap', addModelMap.value)
        //console.log('addModelObj', addModelObj.value)
    }
    else {
         addModelMap.value = {}
        addModelObj.value = {}
        ElMessage({ message: '模型表映射未匹配上(手工添加缺少XunFei Spark,Tencent Cloud,Google Cloud)', type: 'error', duration: 3 * 1000 })
        return
    }
}
let subBigModel=async (formEl)=>{
    //console.log('提交大模型',formEl, addModelObj.value)
    formEl.validate(async (valid) => {
        if (valid) {
            //console.log('submit!')
            fullscreenLoading.value = true
            let res=await commonReqRagFlowServer(addModelMap.value.url, 'post', JSON.stringify(addModelObj.value))
            //console.log('res',res)
            ElLoading
            if(res.code==0){
                addBigModelBoxFlag.value = false
                addModelObj.value = {}
                addModelMap.value = {}
                loadAddModelList();
                loadModelToBeAddedList();
            }
            else{

            }
            fullscreenLoading.value = false
        } else {
            //ElMessage({ message: '请检查表单字段', type: 'error', duration: 3 * 1000 })
            return false
        }
    })
}

//############################
const fullscreenLoading = ref(false)


//console.log('模型字段映射表', modelObjMap)


onMounted(async () => {
    await loadAddModelList();
    await loadDefaultModelObj();
    loadDefaultModelOptions();

    loadModelToBeAddedList();
})

</script>

<template>
    <div class='root'>
        <header>
            <span class="title">模型设置</span>
            <span class="des">在此设置模型参数和API_KEY</span>
            <p class="space"></p>
            <el-button type="primary" :icon="Setting" @click="defaultModelShow = true">设置默认模型</el-button>
        </header>
        <!--已添加的模型-->
        <div class="addModelBox">
            <el-collapse accordion v-model="addModelBoxActivenName">
                <el-collapse-item name="1" title="asas">
                    <template #title>
                        <!-- <el-icon class="header-icon"><info-filled /></el-icon> -->
                        <span class="collapseItemTitle">添加了的模型</span>
                    </template>
                    <div class="main">
                        <div class="modelItemBox" v-for="(item, index) in addedModelList" :key="index">
                            <div class="llmImgBox"><img class="llmImg" :src="item.logo" alt=""></div>
                            <div class="infoBox">
                                <div class="topBox">
                                    <p class="llmName">{{ item.name }}</p>
                                    <el-button type="primary" color="#FFFFFF" @click="editBigModel(item)">编辑key<el-icon
                                            class="el-icon--right">
                                            <Setting />
                                        </el-icon></el-button>
                                    <el-button type="primary" color="#FFFFFF"
                                        @click="showAllSmallModel(item)">展示更多模型<el-icon class="el-icon--right">
                                            <View />
                                        </el-icon></el-button>

                                    <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" :icon="InfoFilled"
                                        icon-color="#626AEF" title="确定要删除么?" @confirm="removeBigModel(item)"
                                        @cancel="cancelEvent">
                                        <template #reference>
                                            <el-button type="primary" color="#FFFFFF"> <el-icon>
                                                    <Close />
                                                </el-icon></el-button>
                                        </template>
                                    </el-popconfirm>

                                </div>
                                <div class="desTxt">{{ item.tags }}</div>
                                <div class="bottomBox">
                                    <div class="item" v-for="(itemllm, indexllm) in item.llm" :key="itemllm.name">
                                        <p class="llmInfo">{{ itemllm.name }}</p>
                                        <p class="type">{{ itemllm.type }}</p>
                                        <el-popconfirm confirm-button-text="Yes" cancel-button-text="No"
                                            :icon="InfoFilled" icon-color="#626AEF" title="确定要删除么?"
                                            @confirm="removeSmallModel(itemllm, item.name)" @cancel="cancelEvent">
                                            <template #reference>
                                                <div class="closeBox"><img src="/imgs/llmClose.png"></div>
                                            </template>
                                        </el-popconfirm>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>

        <!--待添加的模型-->
        <div class="modelToBeAddedBox">
            <el-collapse accordion v-model="modelToBeAddedname">
                <el-collapse-item name="1" title="asas">
                    <template #title>
                        <!-- <el-icon class="header-icon"><info-filled /></el-icon> -->
                        <span class="collapseItemTitle">待添加的模型</span>
                    </template>
                    <div class="main">
                        <ul>
                            <li v-for="(item, index) in modelToBeAddedList" :key="index">
                                <div class="llmImgBox">
                                    <img class="llmImg" :src="item.logo" alt="">
                                </div>
                                <p class="llmName">{{ item.name }}</p>
                                <p class="desc" :title="item.tags">{{ item.tags }}</p>
                                <el-button size="small" type="primary" @click="addBigModel(item)">添加模型</el-button>
                            </li>
                        </ul>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>

        <!--默认模型弹窗-->
        <el-dialog v-model="defaultModelShow" title="设置默认模型" style="border-radius: 10px;">
            <el-form :model="defaultModelObj" label-width="120px">
                <el-form-item label="聊天模型">
                    <el-select v-model="defaultModelObj.llm_id" placeholder="请选择聊天模型">
                        <el-option-group v-for="group in defaultChatModelOptions" :key="group.label"
                            :label="group.label">
                            <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                :value="item.value">
                                <div style="display: flex;align-items: center;">
                                    <el-avatar shape="square" :size="20" :src="item.logo" style="margin-right: 20px;" />
                                    <span>{{ item.label }}</span>
                                </div>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>

                <el-form-item label="嵌入模型">
                    <el-select v-model="defaultModelObj.embd_id" placeholder="请选择嵌入模型">
                        <el-option-group v-for="group in defaultEmbdModelOptions" :key="group.label"
                            :label="group.label">
                            <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                :value="item.value">
                                <div style="display: flex;align-items: center;">
                                    <el-avatar shape="square" :size="20" :src="item.logo" style="margin-right: 20px;" />
                                    <span>{{ item.label }}</span>
                                </div>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>

                <el-form-item label="Img2txt模型">
                    <el-select v-model="defaultModelObj.img2txt_id" placeholder="请选择Img2txt模型">
                        <el-option-group v-for="group in defaultImg2txtModelOptions" :key="group.label"
                            :label="group.label">
                            <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                :value="item.value">
                                <div style="display: flex;align-items: center;">
                                    <el-avatar shape="square" :size="20" :src="item.logo" style="margin-right: 20px;" />
                                    <span>{{ item.label }}</span>
                                </div>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>

                <el-form-item label="Speech2txt模型">
                    <el-select v-model="defaultModelObj.asr_id" placeholder="请选择Speech2txt模型">
                        <el-option-group v-for="group in defaultSpeech2txtModelOptions" :key="group.label"
                            :label="group.label">
                            <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                :value="item.value">
                                <div style="display: flex;align-items: center;">
                                    <el-avatar shape="square" :size="20" :src="item.logo" style="margin-right: 20px;" />
                                    <span>{{ item.label }}</span>
                                </div>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>

                <el-form-item label="Rerank模型">
                    <el-select v-model="defaultModelObj.rerank_id" placeholder="请选择Rerank模型">
                        <el-option-group v-for="group in defaultRerankModelOptions" :key="group.label"
                            :label="group.label">
                            <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                :value="item.value">
                                <div style="display: flex;align-items: center;">
                                    <el-avatar shape="square" :size="20" :src="item.logo" style="margin-right: 20px;" />
                                    <span>{{ item.label }}</span>
                                </div>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>

                <el-form-item label="TTS模型">
                    <el-select v-model="defaultModelObj.tts_id" placeholder="请选择TTS模型">
                        <el-option-group v-for="group in defaultTTSModelOptions" :key="group.label"
                            :label="group.label">
                            <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                :value="item.value">
                                <div style="display: flex;align-items: center;">
                                    <el-avatar shape="square" :size="20" :src="item.logo" style="margin-right: 20px;" />
                                    <span>{{ item.label }}</span>
                                </div>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitDeaultModel">提交</el-button>
                    <el-button>取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--展示更多小模型弹窗-->
        <el-dialog v-model="showAllSmallModelFlag" title="(全部模型)" style="border-radius: 10px;">
            <ul class="allSmallModelsUl">
                <li v-for="(item, index) in allSmallModels" :key="index">
                    <p class="title">{{ item.name }}</p>
                    <p class="type">{{ item.type }}</p>
                    <el-popconfirm confirm-button-text="Yes" cancel-button-text="No" :icon="InfoFilled"
                        icon-color="#626AEF" title="确定要删除么?" @confirm="removeSmallModel(item, showAllSmallModelTitle)"
                        @cancel="cancelEvent">
                        <template #reference>
                            <div class="closeBox"><img src="/imgs/llmClose.png"></div>
                        </template>
                    </el-popconfirm>

                </li>
            </ul>
        </el-dialog>

        <!--新添加模型弹窗-->
        <el-dialog  destroy-on-close v-model="addBigModelBoxFlag" :title="addBigModelBoxTitle" style="border-radius: 10px;">

            <el-form :model="addModelObj" :rules="addModelMap.formRules" label-width="200px" ref="bigModelFormRef">
                <!--OpenAi-->
                <template v-for="(item, index) in addModelMap.fieldsOptions" :key="index">
                     <el-form-item :label="item.label" v-if="item.type == 'select'" :prop="item.prop">
                        <el-select v-model="addModelObj[item.prop]" class="m-2" :placeholder="item.placeholder" >
                            <el-option v-for="item in item.options" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="item.label" v-if="item.type == 'input'" :prop="item.prop">
                        <el-input v-model="addModelObj[item.prop]" :placeholder="item.placeholder"></el-input>
                    </el-form-item>
                     <el-form-item :label="item.label" v-if="item.type == 'number'"   :prop="item.prop">
                        <el-input v-model="addModelObj[item.prop]" :placeholder="item.placeholder" type="number"></el-input>
                    </el-form-item>
                </template>

                <el-form-item>
                    <el-button type="primary" v-loading.fullscreen.lock="fullscreenLoading"  @click="subBigModel(bigModelFormRef)">提交</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>

</template>

<style lang="scss" scoped>
.root {
    min-width: 1560px;
    font-family: "Microsoft YaHei", sans-serif;
    padding: 0;
    margin: 0;
    width: 100%;
    height: calc(100vh - 84px);
    box-sizing: border-box;
    padding: 20px 40px;
    overflow-y: scroll;

    header {
        display: flex;
        align-items: center;

        .title {
            font-size: 16px;
            font-weight: 600;
        }

        .des {
            margin-left: 30px;
            color: #999999;
            font-size: 16px;
            font-weight: 600;
        }

        .space {
            height: 100%;
            flex: 1;
        }
    }

    .addModelBox {
        margin-top: 20px;

        .collapseItemTitle {
            font-size: 16px;
            font-weight: 600;
        }

        .main {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            box-sizing: border-box;

            .modelItemBox {
                box-sizing: border-box;
                width: 49%;
                height: 150px;
                background-color: #F0F1F5;
                border-radius: 10px;
                margin-left: 2%;
                margin-top: 20px;
                display: flex;
                align-items: center;

                .llmImgBox {
                    width: 120px;
                    height: 100%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .llmImg {
                        display: block;
                        width: auto;
                        max-width: 70px;
                        max-height: 100px;
                    }
                }

                .infoBox {
                    width: 0;
                    flex: 1;
                    height: 100%;
                    box-sizing: border-box;
                    padding: 14px;
                    padding-left: 0px;

                    .topBox {
                        display: flex;
                        align-items: flex-start;
                        height: 32px;

                        .llmName {
                            font-size: 16px;
                            width: 340px;
                            color: #000;
                            font-weight: 600;
                        }

                    }

                    .desTxt {
                        color: #000;
                        line-height: 44px;
                        font-size: 16px;
                        font-weight: 600;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .bottomBox {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;
                        height: 34px;
                        overflow: hidden;

                        .item {
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-left: 10px;

                            .llmInfo {
                                height: 100%;
                                box-sizing: border-box;
                                padding: 9px 8px;
                                // background-color: #D2D3D6;
                                border-radius: 10px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }

                            .type {
                                height: 30px;
                                box-sizing: border-box;
                                padding: 4px 8px;
                                background-color: #D2D3D6;
                                border-radius: 10px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }

                            .closeBox {
                                cursor: pointer;
                                height: 30px;
                                width: 32px;
                                background-color: #E6E7EB;
                                display: flex;
                                align-items: center;
                                justify-content: center;

                                img {
                                    display: block;
                                    width: 16px;
                                    height: 16px;
                                }
                            }
                        }

                        .item:nth-child(1) {
                            margin-left: 0;
                        }
                    }
                }
            }

            .modelItemBox:nth-child(1),
            .modelItemBox:nth-child(2) {
                margin-top: 0px;
            }

            .modelItemBox:nth-child(2n+1) {
                margin-left: 0%;
            }
        }

        .el-collapse {
            border: none;
        }

        .el-collapse-item__wrap {
            border: none !important;
        }

    }

    .modelToBeAddedBox {
        margin-top: 10px;

        .collapseItemTitle {
            font-size: 16px;
            font-weight: 600;
        }

        .main {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            box-sizing: border-box;

            ul {
                margin: 0;
                width: 100%;
                display: flex;
                align-items: center;
                flex-wrap: wrap;

                li {
                    list-style: none;
                    width: 176px;
                    height: 248px;
                    background-color: #E9F2FF;
                    border-radius: 10px;
                    margin-left: 30px;
                    margin-top: 20px;

                    .llmImgBox {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 60px;

                        .llmImg {
                            display: block;
                            margin: 0 auto;
                            margin-top: 20px;
                            max-height: 50px;
                            width: auto;
                            max-width: 90%;
                        }
                    }


                    .llmName {
                        margin: 0 auto;
                        margin-top: 20px;
                        font-size: 16px;
                        font-weight: 600;
                        text-align: center;
                        width: 140px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .desc {
                        width: 130px;
                        margin: 0 auto;
                        margin-top: 10px;
                        font-size: 12px;
                        color: #5D6167;
                        word-wrap: break-word;
                        height: 70px;
                        display: -webkit-box;
                        -webkit-line-clamp: 3;
                        /* 显示的行数 */
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    button {
                        display: block;
                        margin: 0 auto;
                        margin-top: 10px;
                    }
                }
            }
        }

        .el-collapse {
            border: none;
        }

        .el-collapse-item__wrap {
            border: none !important;
        }
    }

    .optionItem {
        display: flex;
        align-items: center;
    }

    //展示全部小模型
    .allSmallModelsUl {
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        li {
            height: 32px;
            width: fit-content;
            list-style: none;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 10px;
            margin-left: 10px;
            box-sizing: border-box;

            .title {
                height: 100%;
                box-sizing: border-box;
                padding: 9px 8px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .type {
                height: 30px;
                box-sizing: border-box;
                padding: 4px 8px;
                background-color: #D2D3D6;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .closeBox {
                cursor: pointer;
                height: 30px;
                width: 32px;
                background-color: #E6E7EB;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                    display: block;
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }
}
</style>