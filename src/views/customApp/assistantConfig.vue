<script setup>
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { ref, onMounted, reactive } from "vue";
import { commonReqRagFlowServer } from "@/api/app/ops.js";
import { useRouter, useRoute } from "vue-router"
import { Delete, Edit, Search, Share, Upload, Refresh } from '@element-plus/icons-vue'
import common from '@/utils/common.js'
import { getIcon } from '@/api/kb/icon.js'
const router = useRouter();



//#########################################################加载初始化配置数据
let baseServer = import.meta.env.VITE_APP_BASE_API;
let defaultAssistantIcon = "";
let loadDefaultAssistantIcon = async () => {
    let iconRes = await getIcon(1)
    //console.log("加载助理默认图标",iconRes)
    if (iconRes.code == 200) {
        defaultAssistantIcon = baseServer + iconRes.data.icon
    }
    //console.log("默认图标",defaultAssistantIcon)
}

let kbList = ref([])
let loadKbList = async () => {
    let res = await commonReqRagFlowServer("/api/v1/datasets", "get", null);
    console.log('加载知识库', res)
    if (res.code == 0) {
        // ragflow 0.18.0 returns array directly
        kbList.value = Array.isArray(res.data) ? res.data : (res.data?.kbs || [])
    }
    else {
        ElMessage({ message: res.message, type: 'error', duration: 3 * 1000 })
    }
}


let defaultChatModelOptions = ref([])
let rerankModelOptions = ref([])
let loadAddModelList = async () => {
    try {
        // Try new backend endpoint first (queries ragflow DB directly)
        let res = await commonReqRagFlowServer("/ragflow/model/list", "get", null);
        console.log('加载模型(DB直查)', res)
        if (res.code != 200 || !res.data) {
            throw new Error('DB endpoint failed');
        }
        let data = res.data
        let temp = []
        let rerankTemp = []
        for (let key in data) {
            let llms = data[key].llm || []
            temp.push({ label: key, options: llms.map(item => { return { label: item.name, value: item.name, logo: `/imgs/modelLogo/${key}.svg`, type: item.type } }) })
            for (let m of llms) {
                if (m.type === 'rerank') {
                    rerankTemp.push({ label: `${m.name} (${key})`, value: m.name })
                }
            }
        }
        defaultChatModelOptions.value = temp
        rerankModelOptions.value = rerankTemp
        console.log('模型列表(DB)', temp.length, 'factories, rerank:', rerankTemp.length)
    } catch (e) {
        // Fallback to ragflow internal API
        console.log('DB直查失败, 回退到ragflow API:', e.message)
        let res = await commonReqRagFlowServer("/v1/llm/my_llms", "get", null);
        console.log('加载已添加的模型(API)', res)
        if (res.code == 0) {
            let data = res.data
            let temp = []
            let rerankTemp = []
            for (let key in data) {
                let llms = data[key].llm || []
                temp.push({ label: key, options: llms.map(item => { return { label: item.name, value: item.name, logo: `/imgs/modelLogo/${key}.svg`, type: item.type } }) })
                for (let m of llms) {
                    if (m.type === 'rerank') {
                        rerankTemp.push({ label: `${m.name} (${key})`, value: m.name })
                    }
                }
            }
            defaultChatModelOptions.value = temp
            rerankModelOptions.value = rerankTemp
        }
        else {
            ElMessage({ message: '加载模型列表失败: ' + (res.message || res.msg || ''), type: 'error', duration: 3 * 1000 })
        }
    }
}


//#########################################################助手列表表格
let tableRef = ref(null)
const tableData = ref([])
//加载助手数据
let loadAssistants = async (page = 1, size = 9999, name = "") => {
    let res = await commonReqRagFlowServer("/api/v1/chats", "get", null);
    console.log('加载助手列表', res)
    if (res.code == 0) {
        let data = res.data
        for (let item of data) {
            // ragflow 0.18.0 uses 'avatar', fallback to 'icon'
            if (!item.avatar && !item.icon) {
                item.icon = defaultAssistantIcon
            } else {
                item.icon = item.avatar || item.icon
            }
        }
        tableData.value = data
    }
}
//弹出框标记
let dialogVisible = ref(false)
//弹出框标题
let dialogTitle = ref('')
//聊天助理字段信息
let dialogForm = ref({
    "description": "A helpful dialog",
    "do_refer": "1",
    "icon": "",
    "id": "",
    "kb_ids": [],
    //"kb_names": [],
    "language": "",
    "llm_id": "",
    "llm_setting": {
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0,
        "temperature": 0.0,
        "top_p": 0.0
    },
    "name": "",
    "prompt_config": {
        "empty_response": "",
        "keyword": false,
        "cross_languages": "",
        "tavily_api_key": "",
        "parameters": [{
            "key": "knowledge",
            "optional": false
        }],
        "cross_languages": [],
        "prologue": "你好！ 我是你的助理，有什么可以帮到你的吗？",
        "quote": true,
        "reasoning": false,
        "refine_multiturn": false,
        "system": "你是一个智能助手，请总结知识库的内容来回答问题，请列举知识库中的数据详细回答。当所有知识库内容都与问题无关时，你的回答必须包括“知识库中未找到您要的答案！”这句话。回答需要考虑聊天历史。\n        以下是知识库：\n        {knowledge}\n        以上是知识库。",
        "tts": false,
        "use_kg": false
    },
    //"prompt_type": "simple",
    "rerank_id": "",
    "similarity_threshold": 0.0,
    //"status": "1",
    //"tenant_id": "",
    //"top_k": 1024,
    "top_n": 8,
    "vector_similarity_weight": 0.0
})
// ragflow 0.18.0 API <-> form format converters
const ragflowToForm = (data) => {
    // Convert ragflow 0.18.0 chat assistant response to form format
    return {
        id: data.id || "",
        name: data.name || "",
        description: data.description || "",
        icon: data.avatar || data.icon || "",
        do_refer: data.do_refer || "1",
        language: data.language || "",
        llm_id: data.llm?.model_name || "",
        llm_setting: {
            temperature: data.llm?.temperature ?? 0.1,
            top_p: data.llm?.top_p ?? 0.3,
            presence_penalty: data.llm?.presence_penalty ?? 0.4,
            frequency_penalty: data.llm?.frequency_penalty ?? 0.7,
        },
        kb_ids: (data.datasets || []).map(d => d.id || d),
        rerank_id: data.prompt?.rerank_model || "",
        similarity_threshold: data.prompt?.similarity_threshold ?? 0.2,
        vector_similarity_weight: data.prompt?.keywords_similarity_weight ?? 0.7,
        top_n: data.prompt?.top_n ?? 6,
        prompt_config: {
            system: data.prompt?.prompt || "",
            prologue: data.prompt?.opener || "",
            empty_response: data.prompt?.empty_response || "",
            quote: data.prompt?.show_quote ?? true,
            keyword: data.prompt?.keywords ?? false,
            refine_multiturn: data.prompt?.refine_multiturn ?? false,
            tts: data.prompt?.tts ?? false,
            reasoning: data.prompt?.reasoning ?? false,
            use_kg: data.prompt?.use_kg ?? false,
            cross_languages: data.prompt?.cross_languages || [],
            tavily_api_key: "",
            parameters: data.prompt?.variables || [{ key: "knowledge", optional: false }],
        },
    }
}

const formToRagflow = (form) => {
    // Convert form format to ragflow 0.18.0 API format
    let payload = {
        name: form.name,
        description: form.description,
        avatar: form.icon,
        do_refer: form.do_refer,
        language: form.language || "Chinese",
        llm: {
            model_name: form.llm_id,
            temperature: form.llm_setting.temperature,
            top_p: form.llm_setting.top_p,
            presence_penalty: form.llm_setting.presence_penalty,
            frequency_penalty: form.llm_setting.frequency_penalty,
            max_tokens: 512,
        },
        datasets: form.kb_ids,
        prompt: {
            prompt: form.prompt_config.system,
            opener: form.prompt_config.prologue,
            empty_response: form.prompt_config.empty_response,
            show_quote: form.prompt_config.quote,
            keywords: form.prompt_config.keyword,
            refine_multiturn: form.prompt_config.refine_multiturn,
            tts: form.prompt_config.tts,
            reasoning: form.prompt_config.reasoning,
            use_kg: form.prompt_config.use_kg,
            rerank_model: form.rerank_id || "",
            similarity_threshold: form.similarity_threshold,
            keywords_similarity_weight: form.vector_similarity_weight,
            top_n: form.top_n,
            variables: form.prompt_config.parameters,
            cross_languages: form.prompt_config.cross_languages || [],
        },
    }
    return payload
}

//打开弹出框
const openDialogBox = async (data = null) => {
    console.log('弹出配置框', data)
    if (data == null) {
        dialogTitle.value = '新增助理信息'
        // Reset form to default
        dialogForm.value = {
            "description": "A helpful dialog",
            "do_refer": "1",
            "icon": "",
            "id": "",
            "kb_ids": [],
            "language": "Chinese",
            "llm_id": "",
            "llm_setting": {
                "frequency_penalty": 0.7,
                "presence_penalty": 0.4,
                "temperature": 0.1,
                "top_p": 0.3
            },
            "name": "",
            "prompt_config": {
                "empty_response": "",
                "keyword": false,
                "cross_languages": [],
                "tavily_api_key": "",
                "parameters": [{
                    "key": "knowledge",
                    "optional": false
                }],
                "prologue": "你好！ 我是你的助理，有什么可以帮到你的吗？",
                "quote": true,
                "reasoning": false,
                "refine_multiturn": false,
                "system": '你是一个智能助手，请总结知识库的内容来回答问题，请列举知识库中的数据详细回答。当所有知识库内容都与问题无关时，你的回答必须包括"知识库中未找到您要的答案！"这句话。回答需要考虑聊天历史。\n        以下是知识库：\n        {knowledge}\n        以上是知识库。',
                "tts": false,
                "use_kg": false
            },
            "rerank_id": "",
            "similarity_threshold": 0.2,
            "top_n": 6,
            "vector_similarity_weight": 0.7
        }
        dialogVisible.value = true
    }
    else {
        dialogTitle.value = '编辑助理信息'
        // Convert ragflow 0.18.0 format to form format
        dialogForm.value = ragflowToForm(data)
        dialogVisible.value = true
    }
}
//提交弹出框数据
const submitForm = async () => {
    console.log('提交数据', dialogForm.value)

    if (dialogForm.value.name == "") {
        ElMessage.error('请输入助理名称')
        return
    }
    if (dialogForm.value.llm_id == "") {
        ElMessage.error('请选择模型')
        return
    }
    if (dialogForm.value.prompt_config?.system == "") {
        ElMessage.error('请输入系统提示词')
        return
    }
    const isUpdate = !!dialogForm.value.id;
    const chatUrl = isUpdate ? `/api/v1/chats/${dialogForm.value.id}` : "/api/v1/chats";
    const chatMethod = isUpdate ? "put" : "post";
    // Convert form to ragflow 0.18.0 API format
    const payload = formToRagflow(dialogForm.value);
    let res = await commonReqRagFlowServer(chatUrl, chatMethod, JSON.stringify(payload));
    console.log('提交数据后返回', res)
    if (res.code == 0) {
        ElMessage.success('提交成功')
        dialogVisible.value = false
        loadAssistants();
    }
    else {
        ElMessage.error(res.message)
    }
}
let dialogFormRef = ref();
const rules = reactive({
    name: [
        { required: true, message: '请输入助理名称', trigger: 'blur' },
        // { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
    ],
    llm_id: [
        { required: true, message: '请选模型', trigger: 'change' },
    ],
    prompt_config: {
        system: [
            { required: true, message: '请输入系统提示词', trigger: 'blur' },
        ]
    }
})

//删除助理
let deleteAssistant = async (...ids) => {
    console.log('删除助理', ids)
    ElMessageBox.confirm('确认要删除么？', '', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
    })
        .then(async() => {
            console.log('删除助理', ids)
            let res = await commonReqRagFlowServer("/api/v1/chats", "delete", JSON.stringify({ "ids": ids }));
            console.log('删除助理后返回', res)
            if (res.code == 0) {
                ElMessage.success('删除成功')
                loadAssistants();
            }
            else {
                ElMessage.error(res.message)
            }
        })
        .catch(() => {
            console.log('删除失败', ids)
        })

}
//删除选中助理
let delMoreAssistant = async () => {
    //console.log('选中助理',tableRef.value.getSelectionRows())
    let ids = tableRef.value.getSelectionRows().map(item => item.id)
    //console.log('选中助理',ids)
    if (ids.length == 0) {
        ElMessage.error('请选择助理')
        return
    }
    deleteAssistant(ids)
}



//关键字维护
let addKeywords = () => {
    dialogForm.value.prompt_config.parameters.push({ key: "", optional: true })
}
let removeKeywords = (index) => {
    dialogForm.value.prompt_config.parameters.splice(index, 1)
}




//#########################################################初始化
let init = async () => {
    await loadDefaultAssistantIcon();
    await loadAddModelList();
    loadKbList();
    await loadAssistants();
}













//******************************************Tool */
let activeName = ref('first')//当前激活的tab
let handleChange = async (e) => {
    let base64 = await common.file2Base64(e.raw)
    console.log(base64)
    dialogForm.value.icon = base64
}
const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' }
]
let randomValue = ref('')
const randomOptions = ['精确', '即兴创作', '平衡']
let changeRandom = (e) => {
    console.log('切换自由度', e)
    if (e == '精确') {
        dialogForm.value.llm_setting.temperature = 0.10
        dialogForm.value.llm_setting.top_p = 0.30
        dialogForm.value.llm_setting.presence_penalty = 0.40
        dialogForm.value.llm_setting.frequency_penalty = 0.70
    }
    else if (e == '即兴创作') {
        dialogForm.value.llm_setting.temperature = 0.90
        dialogForm.value.llm_setting.top_p = 0.90
        dialogForm.value.llm_setting.presence_penalty = 0.40
        dialogForm.value.llm_setting.frequency_penalty = 0.20
    }
    else {//平衡
        dialogForm.value.llm_setting.temperature = 0.50
        dialogForm.value.llm_setting.top_p = 0.50
        dialogForm.value.llm_setting.presence_penalty = 0.40
        dialogForm.value.llm_setting.frequency_penalty = 0.70
    }

}



onMounted(async () => {
    await init()
})

</script>



<template>
    <div class='root'>
        <!-- <header>
            <el-input v-model="searchObj.keywords" style="width:200px" placeholder="请输入名称关键字" />
            <div style="width: 20px;height: 100%;"></div>
            <el-button type="primary" :icon="Search">搜索</el-button>
        </header> -->
        <div class="toolbar" style="margin-top: 20px;">
            <el-button type="primary" size="small" :icon="Add" @click="openDialogBox(null)">新增</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="delMoreAssistant">删除</el-button>


            <p style="flex: 1;"></p>
            <el-button @click="loadAssistants()" :icon="Refresh" circle />
        </div>
        <div class="tableBox">

            <el-table :data="tableData" style="width: 100%" ref="tableRef" row-key="id" height="600">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="name" label="助理名称" min-width="100" align="center" />

                <el-table-column prop="icon" label="助理头像" min-width="80" align="center">
                    <template #default="scope">
                        <!-- {{ scope.row.avatar }} -->
                        <!-- <el-image preview-teleported :preview-src-list="srcList" /> -->
                        <el-image style="width: 80%; height: 80%;border-radius: 10px;max-width: 50px;max-height: 50px"
                            :src="scope.row.icon" :fit="fit" />
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="助理描述" min-width="200" align="center" />
                <el-table-column fixed="right" label="操作 " min-width="100 " align="center">
                    <template #default="scope">
                        <el-button link type="primary" size="small" @click="openDialogBox(scope.row)" :icon="Edit">
                            编辑
                        </el-button>
                        <el-button link type="primary" size="small" :icon="Delete"
                            @click="deleteAssistant(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 弹出的编辑或者添加助理的表单 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%"
            style="box-sizing: border-box;padding: 10px 20px;">

            <el-form :model="dialogForm" label-width="150px" ref="dialogFormRef" :rules="rules">
                <el-tabs v-model="activeName" class="demo-tabs">
                    <el-tab-pane label="助理设置" name="first">
                        <el-form-item label="助理名称" prop="name">
                            <el-input v-model="dialogForm.name" />
                        </el-form-item>
                        <el-form-item label="助理描述" prop="description">
                            <el-input v-model="dialogForm.description" />
                        </el-form-item>

                        <el-form-item label="头像">
                            <el-upload class="avatar-uploader" action="#" :auto-upload="false" :show-file-list="false"
                                :on-change="handleChange">
                                <img v-if="dialogForm.icon" :src="dialogForm.icon" class="avatar"
                                    style="width: 80px;height: 80px;object-fit: fill;" />
                                <!-- <div class="uploadIconBox"> -->
                                <p v-if="dialogForm.icon" style="width: 10px;height: 50px;"></p>
                                <el-icon class="avatar-uploader-icon" size="80"
                                    style="border: 1px dashed #ccc;box-sizing:border-box;padding: 20px;">
                                    <Plus />
                                </el-icon>
                                <!-- </div> -->

                            </el-upload>
                        </el-form-item>
                        <el-form-item label="空回复"
                            title="如果在知识库中没有检索到用户的问题，它将使用它作为答案。 如果您希望 LLM 在未检索到任何内容时提出自己的意见，请将此留空。">
                            <el-input v-model="dialogForm.prompt_config.empty_response" />
                        </el-form-item>
                        <el-form-item label="设置开场白" title="您想如何欢迎您的客户？">
                            <el-input v-model="dialogForm.prompt_config.prologue" type="textarea" :rows=2 />
                        </el-form-item>
                        <el-form-item label="显示引文" title="是否应该显示原文出处">
                            <el-switch v-model="dialogForm.prompt_config.quote" />
                        </el-form-item>
                        <el-form-item label="关键词分析" title="应用 LLM 分析用户的问题，提取在相关性计算中要强调的关键词。">
                            <el-switch v-model="dialogForm.prompt_config.keyword" />
                        </el-form-item>
                        <el-form-item label="文本转语音" title="是否用语音转换播放语音，请先在设置里面选择TTS（语音转换模型）。">
                            <el-switch v-model="dialogForm.prompt_config.tts" />
                        </el-form-item>
                        <el-form-item label="Tavily API Key" title="如果 API 密钥设置正确，它将利用 Tavily 进行网络搜索作为知识库的补充。">
                            <el-input v-model="dialogForm.prompt_config.tavily_api_key" type="password" show-password />
                        </el-form-item>
                        <el-form-item label="知识库" title="选择关联的知识库。新建或空知识库不会在下拉菜单中显示。">
                            <el-select v-model="dialogForm.kb_ids" multiple filterable default-first-option
                                :reserve-keyword="false" placeholder="选择知识库">
                                <el-option v-for="item in kbList" :key="item.id" :label="item.name" :value="item.id" />
                            </el-select>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="提示引擎" name="second">
                        <el-form-item label="系统提示词" prop="prompt_config.system"
                            title="当LLM回答问题时，你需要LLM遵循的说明，比如角色设计、答案长度和答案语言等。如果您的模型原生支持在问答中推理，可以通过 //no_thinking 关闭自动推理。">
                            <el-input v-model="dialogForm.prompt_config.system" type="textarea"
                                :autosize="{ minRows: 2, maxRows: 4 }" />
                        </el-form-item>
                        <el-form-item label="相似度阈值" prop="similarity_threshold"
                            title="我们使用混合相似度得分来评估两行文本之间的距离。 它是加权关键词相似度和向量余弦相似度。 如果查询和块之间的相似度小于此阈值，则该块将被过滤掉。默认设置为 0.2，也就是说文本块的混合相似度得分至少 20 才会被召回。">
                            <!-- <el-slider v-model="dialogForm.similarity_threshold" :format-tooltip="formatTooltip" /> -->
                            <el-input-number v-model="dialogForm.similarity_threshold" :precision="2" :step="0.1"
                                :max="1" :min="0" />
                        </el-form-item>
                        <el-form-item label="关键字相似度权重" prop="vector_similarity_weight"
                            title="我们使用混合相似性评分来评估两行文本之间的距离。它是加权关键字相似性和矢量余弦相似性或rerank得分（0〜1）。两个权重的总和为1.0。">
                            <!-- <el-slider v-model="dialogForm.vector_similarity_weight" :format-tooltip="formatTooltip" /> -->
                            <el-input-number v-model="dialogForm.vector_similarity_weight" :precision="2" :step="0.1"
                                :max="1" :min="0" />
                        </el-form-item>
                        <el-form-item label="Top N" title="并非所有相似度得分高于“相似度阈值”的块都会被提供给大语言模型。 LLM 只能看到这些“Top N”块。">
                            <!-- <el-slider v-model="dialogForm.llm_setting.top_p" :format-tooltip="formatTooltip" /> -->
                            <el-input-number v-model="dialogForm.top_n" :step="1" :max="30" :min="0" />
                        </el-form-item>
                        <el-form-item label="多轮对话优化" title="在多轮对话的中，对去知识库查询的问题进行优化。会调用大模型额外消耗token。">
                            <el-switch v-model="dialogForm.prompt_config.refine_multiturn" />
                        </el-form-item>
                        <el-form-item label="使用知识图"
                            title="是否检索与所选知识库对应的知识图谱相关文本块，以处理复杂的多跳问题？这一过程将涉及对实体、关系和社区报告文本块的多次检索，会显著延长检索时间">
                            <el-switch v-model="dialogForm.prompt_config.use_kg" />
                        </el-form-item>
                        <el-form-item label="推理"
                            title="在问答过程中是否启用推理工作流，例如Deepseek-R1或OpenAI o1等模型所采用的方式。启用后，该功能允许模型访问外部知识，并借助思维链推理等技术逐步解决复杂问题。通过将问题分解为可处理的步骤，这种方法增强了模型提供准确回答的能力，从而在需要逻辑推理和多步思考的任务上表现更优。">
                            <el-switch v-model="dialogForm.prompt_config.reasoning" />
                        </el-form-item>
                        <el-form-item label="Rerank模型"
                            title="非必选项：若不选择 rerank 模型，系统将默认采用关键词相似度与向量余弦相似度相结合的混合查询方式；如果设置了 rerank 模型，则混合查询中的向量相似度部分将被 rerank 打分替代。请注意：采用 rerank 模型会非常耗时">
                            <el-select v-model="dialogForm.rerank_id" filterable allow-create default-first-option
                                :reserve-keyword="false" placeholder="Rerank模型" clearable>
                                <el-option v-for="item in rerankModelOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="跨语言搜索" title="选择一种或多种语言进行跨语言搜索。如果未选择任何语言，系统将使用原始查询进行搜索。">
                            <el-select v-model="dialogForm.prompt_config.cross_languages" multiple filterable
                                allow-create default-first-option :reserve-keyword="false" placeholder="选择语言">
                                <el-option v-for="item in languageOptions" :key="item.value" :label="item.name"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="变量"
                            title="你可以通过对话 API，并配合变量设置来动态调整大模型的系统提示词。 {knowledge}为系统预留变量，代表从指定知识库召回的文本块。 “系统提示词”中的所有变量都必须用大括号{}括起来。详见 https://ragflow.io/docs/dev/set_chat_variables。">
                            <div class="keywordsBox">
                                <div class="keywordsBoxHeader">
                                    <p class="item">关键字</p>
                                    <p class="item">可选的</p>
                                    <p class="item">操作</p>
                                </div>
                                <div class="keywordsLineBox"
                                    v-for="(item, index) in dialogForm.prompt_config.parameters" :key="index">
                                    <div class="keywordsLineItem"><el-input class="keyname" v-model="item.key"
                                            placeholder="变量名" /></div>
                                    <div class="keywordsLineItem"><el-switch class="optional" v-model="item.optional" />
                                    </div>
                                    <div class="keywordsLineItem"><el-button class="del"
                                            @click="removeKeywords(index)">删除</el-button></div>
                                </div>
                                <el-button style="width: 100%;" @click="addKeywords"><el-icon>
                                        <Plus />添加关键字
                                    </el-icon></el-button>
                            </div>
                        </el-form-item>

                    </el-tab-pane>
                    <el-tab-pane label="模型设置" name="third">

                        <el-form-item label="模型" title="大语言聊天模型" prop="llm_id">
                            <el-select v-model="dialogForm.llm_id" placeholder="请选择聊天模型">
                                <el-option-group v-for="group in defaultChatModelOptions" :key="group.label"
                                    :label="group.label">
                                    <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                        :value="item.value">
                                        <div style="display: flex;align-items: center;">
                                            <el-avatar shape="square" :size="20" :src="item.logo"
                                                style="margin-right: 20px;" />
                                            <span>{{ item.label }}</span>
                                        </div>
                                    </el-option>
                                </el-option-group>
                            </el-select>
                        </el-form-item>
                        <div class="randomBox">
                            <p class="randomTitle">自由度</p>
                            <el-select v-model="randomValue" class="m-2" placeholder="切换自由度"
                                style="width:120px;border-radius: 20px;" @change="changeRandom">
                                <el-option v-for="item in randomOptions" :key="item" :label="item" :value="item" />
                            </el-select>
                        </div>
                        <div style="width: 100%;height: 20px;"></div>
                        <el-form-item label="温度" title="该参数控制模型预测的随机性。 较低的温度使模型对其响应更有信心，而较高的温度则使其更具创造性和多样性。">
                            <!-- <el-slider v-model="dialogForm.llm_setting.temperature"  :format-tooltip="formatTooltip" @change="changeSlider"/> -->
                            <el-input-number v-model="dialogForm.llm_setting.temperature" :precision="2" :step="0.1"
                                :max="1" :min="0" />
                        </el-form-item>
                        <el-form-item label="Top P" title="该参数也称为“核心采样”，它设置一个阈值来选择较小的单词集进行采样。 它专注于最可能的单词，剔除不太可能的单词。">
                            <!-- <el-slider v-model="dialogForm.llm_setting.top_p"  :format-tooltip="formatTooltip" @change="changeSlider"/> -->
                            <el-input-number v-model="dialogForm.llm_setting.top_p" :precision="2" :step="0.1" :max="1"
                                :min="0" />
                        </el-form-item>
                        <el-form-item label="存在处罚" title="这会通过惩罚对话中已经出现的单词来阻止模型重复相同的信息。">
                            <!-- <el-slider v-model="dialogForm.llm_setting.presence_penalty"  :format-tooltip="formatTooltip" @change="changeSlider"/> -->
                            <el-input-number v-model="dialogForm.llm_setting.presence_penalty" :precision="2"
                                :step="0.1" :max="1" :min="0" />
                        </el-form-item>
                        <el-form-item label="频率惩罚" title="与存在惩罚类似，这减少了模型频繁重复相同单词的倾向。">
                            <!-- <el-slider v-model="dialogForm.llm_setting.frequency_penalty" min="0" max="1"   /> -->
                            <el-input-number v-model="dialogForm.llm_setting.frequency_penalty" :precision="2"
                                :step="0.1" :max="1" :min="0" />
                        </el-form-item>
                    </el-tab-pane>
                </el-tabs>
                <el-form-item>
                    <el-button type="primary" @click="submitForm(dialogFormRef)">
                        提交
                    </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.root {
    width: 100%;
    height: calc(100vh - 84px);
    box-sizing: border-box;
    padding: 20px 10px;

    header {
        display: flex;
        align-items: center;
    }

    .toolbar {
        display: flex;
    }

    .tableBox {
        margin-top: 30px;
    }

    .paginationBox {
        box-sizing: border-box;
        padding-right: 50px;
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    //变量盒子
    .keywordsBox {
        width: 100%;

        .keywordsBoxHeader {
            height: 50px;
            display: flex;
            align-items: center;

            .item {
                font-size: 14px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
            }

            .item:nth-child(1) {
                width: 60%;
            }

            .item:nth-child(2) {
                width: 20%;
            }

            .item:nth-child(3) {
                width: 20%;
            }

        }

        .keywordsLineBox {
            display: flex;
            align-items: center;

            .keywordsLineItem {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .keywordsLineItem:nth-child(1) {
                width: 60%;
            }

            .keywordsLineItem:nth-child(2) {
                width: 20%;
            }

            .keywordsLineItem:nth-child(3) {
                width: 20%;
            }
        }
    }

    //自由度盒子
    .randomBox {
        height: 52px;
        background-color: #F1F5F9;
        display: flex;
        align-items: center;
        justify-content: space-around;

        .randomTitle {
            font-size: 18px;
            font-weight: 600;
        }
    }



}
</style>