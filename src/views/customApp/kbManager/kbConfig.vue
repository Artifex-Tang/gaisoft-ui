<script setup>
import { ref, onMounted } from "vue";
import { commonReqRagFlowServer } from "@/api/app/ops.js";
import { ElMessage } from 'element-plus'
import common from '@/utils/common.js'

const props = defineProps({
    kb_id: {
        type: String,
        default: "",
        required: true
    }
})

let loading = ref(true)
let saving = ref(false)
let chunkCount = ref(0)
let embeddingModelOptions = ref([])

// ragflow 0.18 chunk_method options
const chunkMethodOptions = [
    { value: 'naive', label: '通用' },
    { value: 'manual', label: '手动' },
    { value: 'qa', label: 'Q&A' },
    { value: 'table', label: '表格' },
    { value: 'paper', label: '论文' },
    { value: 'book', label: '书籍' },
    { value: 'laws', label: '法律' },
    { value: 'presentation', label: '演示文稿' },
    { value: 'picture', label: '图片' },
    { value: 'one', label: '整篇' },
    { value: 'email', label: '邮件' },
    { value: 'tag', label: '标签' },
]

let formObj = ref({
    name: "",
    avatar: "",
    description: "",
    permission: "me",
    embedding_model: "",
    chunk_method: "naive",
    parser_config: {
        chunk_token_num: 128,
        delimiter: "\\n!?;。;!？",
        html4excel: false,
        layout_recognize: "DeepDOC",
        raptor: { use_raptor: false },
        graphrag: { use_graphrag: false },
        pages: [[1, 1000000]],
    },
    similarity_threshold: 0.2,
    vector_similarity_weight: 0.3,
})

// image upload
let handleChange = async (e) => {
    let base64 = await common.file2Base64(e.raw)
    formObj.value.avatar = base64
}

// load dataset config from ragflow
let loadConfig = async () => {
    if (!props.kb_id) return
    loading.value = true
    try {
        let res = await commonReqRagFlowServer(`/api/v1/datasets?id=${props.kb_id}`, 'get', null)
        console.log('加载知识库配置', res)
        if (res.code == 0 && res.data) {
            let ds = res.data
            formObj.value.name = ds.name || ""
            formObj.value.avatar = ds.avatar || ""
            formObj.value.description = ds.description || ""
            formObj.value.permission = ds.permission || "me"
            formObj.value.embedding_model = ds.embedding_model || ""
            formObj.value.chunk_method = ds.chunk_method || "naive"
            chunkCount.value = ds.chunk_count || 0
            formObj.value.similarity_threshold = ds.similarity_threshold ?? 0.2
            formObj.value.vector_similarity_weight = ds.vector_similarity_weight ?? 0.3
            if (ds.parser_config) {
                formObj.value.parser_config = { ...formObj.value.parser_config, ...ds.parser_config }
            }
        } else {
            ElMessage.error(res.message || '加载配置失败')
        }
    } catch (e) {
        console.error('加载配置出错', e)
        ElMessage.error('加载配置出错')
    }
    loading.value = false
}

// save config
let saveConfig = async () => {
    if (!props.kb_id) return
    if (!formObj.value.name) {
        ElMessage.error('知识库名称不能为空')
        return
    }
    saving.value = true
    try {
        let payload = {
            name: formObj.value.name,
            description: formObj.value.description,
            permission: formObj.value.permission,
            chunk_method: formObj.value.chunk_method,
            parser_config: formObj.value.parser_config,
            similarity_threshold: formObj.value.similarity_threshold,
            vector_similarity_weight: formObj.value.vector_similarity_weight,
        }
        // embedding_model can only be changed when chunk_count is 0
        if (formObj.value.embedding_model && chunkCount.value === 0) {
            payload.embedding_model = formObj.value.embedding_model
        }
        if (formObj.value.avatar) {
            payload.avatar = formObj.value.avatar
        }
        let res = await commonReqRagFlowServer(
            `/api/v1/datasets/${props.kb_id}`,
            'put',
            JSON.stringify(payload)
        )
        console.log('保存配置返回', res)
        if (res.code == 0) {
            ElMessage.success('保存成功')
        } else {
            ElMessage.error(res.message || '保存失败')
        }
    } catch (e) {
        console.error('保存配置出错', e)
        ElMessage.error('保存配置出错')
    }
    saving.value = false
}

// load available embedding models from ragflow
let loadEmbeddingModels = async () => {
    try {
        // Try new backend endpoint first (queries ragflow DB directly)
        let res = await commonReqRagFlowServer("/ragflow/model/list", "get", null)
        if (res.code == 200 && res.data) {
            let models = []
            for (let factory in res.data) {
                let llms = res.data[factory].llm || []
                for (let m of llms) {
                    let mType = (m.type || '').toLowerCase()
                    if (mType === 'embedding' || mType === 'embd') {
                        models.push({
                            value: `${m.name}___${factory}`,
                            label: `${m.name} (${factory})`,
                            factory: factory,
                        })
                    }
                }
            }
            embeddingModelOptions.value = models
            console.log('嵌入模型列表(DB)', models.length)
            return
        }
    } catch (e) {
        console.log('DB直查失败, 回退:', e.message)
    }
    // Fallback to ragflow internal API
    try {
        let res = await commonReqRagFlowServer('/v1/llm/my_llms', 'get', null)
        if (res.code == 0 && res.data) {
            let models = []
            let data = res.data
            if (Array.isArray(data)) {
                for (let item of data) {
                    if (item.llm) {
                        for (let m of (item.llm || [])) {
                            let mType = (m.type || '').toLowerCase()
                            if (mType === 'embedding' || mType === 'embd') {
                                models.push({
                                    value: m.name || m.model_name,
                                    label: `${m.name || m.model_name}`,
                                    factory: item.factory || '',
                                })
                            }
                        }
                    }
                }
            } else {
                for (let factory in data) {
                    let llms = data[factory].llm || []
                    for (let m of llms) {
                        let mType = (m.type || '').toLowerCase()
                        if (mType === 'embedding' || mType === 'embd') {
                            models.push({
                                value: `${m.name}___${factory}`,
                                label: `${m.name} (${factory})`,
                                factory: factory,
                            })
                        }
                    }
                }
            }
            embeddingModelOptions.value = models
            console.log('嵌入模型列表(API)', models.length)
        }
    } catch (e) {
        console.error('加载嵌入模型列表出错', e)
    }
}

onMounted(() => {
    loadConfig()
    loadEmbeddingModels()
})
</script>

<template>
    <div class='kbConfigRoot' v-loading="loading">
        <div class="topBox">
            <p class="desTitle">更新知识库配置，尤其是切片方法。</p>
            <el-form label-width="140px" :model="formObj" label-position="left">

                <el-form-item label="知识库名称" prop="name" style="width: 90%;">
                    <el-input v-model="formObj.name" />
                </el-form-item>

                <el-form-item label="描述" prop="description" style="width: 90%;">
                    <el-input v-model="formObj.description" type="textarea" :rows="3" />
                </el-form-item>

                <el-form-item label="知识库图片" prop="avatar" style="width: 90%;">
                    <el-upload class="avatar-uploader" action="#" :auto-upload="false" :show-file-list="false"
                        :on-change="handleChange">
                        <img v-if="formObj.avatar" :src="formObj.avatar" class="avatar"
                            style="width: 80px;height: 80px;object-fit: fill;border-radius: 8px;" />
                        <el-icon v-else class="avatar-uploader-icon" size="60" color="#ccc"
                            style="border: 1px dashed #ccc;box-sizing:border-box;padding: 20px;border-radius: 8px;">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>

                <el-form-item label="嵌入模型" prop="embedding_model" style="width: 90%;">
                    <el-select v-model="formObj.embedding_model" placeholder="选择嵌入模型" style="width: 300px" :disabled="chunkCount > 0">
                        <el-option v-for="item in embeddingModelOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                    <span v-if="chunkCount > 0" style="color:#E6A23C;font-size:12px;margin-left:10px;">
                        已有 {{ chunkCount }} 个分块，不可更改嵌入模型
                    </span>
                </el-form-item>

                <el-form-item label="切片方法" prop="chunk_method" style="width: 90%;">
                    <el-select v-model="formObj.chunk_method" placeholder="选择切片方法" style="width: 300px">
                        <el-option v-for="item in chunkMethodOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="分块 token 数" prop="parser_config.chunk_token_num" style="width: 90%;">
                    <el-input-number v-model="formObj.parser_config.chunk_token_num" :min="1" :max="100000" />
                </el-form-item>

                <el-form-item label="分隔符" prop="parser_config.delimiter" style="width: 90%;">
                    <el-input v-model="formObj.parser_config.delimiter" />
                </el-form-item>

                <el-form-item label="布局识别" prop="parser_config.layout_recognize" style="width: 90%;">
                    <el-select v-model="formObj.parser_config.layout_recognize" style="width: 300px">
                        <el-option label="DeepDOC" value="DeepDOC" />
                        <el-option label="开源模型" value="DocLayNet" />
                        <el-option label="不使用" value="Naive" />
                    </el-select>
                </el-form-item>

                <el-form-item label="相似度阈值" prop="similarity_threshold" style="width: 90%;">
                    <el-slider v-model="formObj.similarity_threshold" :min="0" :max="1" :step="0.01"
                        show-input input-size="small" style="width: 300px" />
                </el-form-item>

                <el-form-item label="向量相似度权重" prop="vector_similarity_weight" style="width: 90%;">
                    <el-slider v-model="formObj.vector_similarity_weight" :min="0" :max="1" :step="0.01"
                        show-input input-size="small" style="width: 300px" />
                </el-form-item>

                <el-form-item style="width: 90%;">
                    <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
                </el-form-item>

            </el-form>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.kbConfigRoot {
    color: #000;
    width: 100%;
    height: calc(90vh - 100px);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 20px 50px;

    .topBox {
        width: 100%;

        .desTitle {
            font-weight: 600;
            margin-bottom: 20px;
        }
    }
}
</style>
