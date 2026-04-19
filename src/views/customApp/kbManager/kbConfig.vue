<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router"
import { commonReqRagFlowServer } from "@/api/app/ops.js";
import { Delete, Edit, Search, Share, Upload, Refresh } from '@element-plus/icons-vue'
import common from '@/utils/common.js'
const router = useRouter();

let formObj = ref({
    name: "",
    avatar: "",
    description: '',
    permission: "team",
    parser_id: "",//切片方法
});
//图片上传处理
let handleChange = async (e) => {
    let base64 = await common.file2Base64(e.raw)
    console.log(base64)
    formObj.value.avatar = base64
}
const options = [
  {
    label: 'Popular cities',
    options: [
      {
        value: 'Shanghai',
        label: 'Shanghai',
      },
      {
        value: 'Beijing',
        label: 'Beijing',
      },
    ],
  },
  {
    label: 'City name',
    options: [
      {
        value: 'Chengdu',
        label: 'Chengdu',
      },
      {
        value: 'Shenzhen',
        label: 'Shenzhen',
      },
      {
        value: 'Guangzhou',
        label: 'Guangzhou',
      },
      {
        value: 'Dalian',
        label: 'Dalian',
      },
    ],
  },
]
</script>

<template>
    <div class='kbConfigRoot'>
        <div class="topBox">
            <p class="desTitle">在这里更新您的知识库详细信息，尤其是切片方法。</p>
            <el-form label-width="120px" status-icon :model="formObj" label-position="left" inline="true"
                style="display: flex;flex-direction: column;flex-wrap: wrap;">

                <el-form-item label="知识库名称" prop="name" style="width: 45%;">
                    <el-input v-model="formObj.name" />
                </el-form-item>
                <el-form-item label="知识库图片" prop="avatar" style="width: 45%;">
                    <el-upload class="avatar-uploader" action="#" :auto-upload="false" :show-file-list="false"
                        :on-change="handleChange">
                        <img v-if="formObj.avatar" :src="formObj.avatar" class="avatar"
                            style="width: 80px;height: 80px;object-fit: fill;" />
                        <!-- <div class="uploadIconBox"> -->
                        <p v-if="formObj.avatar" style="width: 10px;height: 50px;"></p>
                        <el-icon class="avatar-uploader-icon" size="100" color="#ccc"
                            style="border: 1px dashed #ccc;box-sizing:border-box;padding: 20px;">
                            <Plus />
                        </el-icon>
                        <!-- </div> -->

                    </el-upload>
                </el-form-item>
                <el-form-item label="描述" prop="description" style="width: 45%;">
                    <el-input v-model="formObj.description" />
                </el-form-item>
                <el-form-item label="描述" prop="description" style="width: 45%;">
                    <el-select v-model="value" class="m-2" placeholder="Select" size="large" style="width: 240px">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="PDF解析器" prop="description" style="width: 45%;" title="使用视觉模型进行 PDF 布局分析，以更好地识别文档结构，找到标题、文本块、图像和表格的位置。 如果选择 Naive 选项，则只能获取 PDF 的纯文本。请注意该功能只适用于 PDF 文档，对其他文档不生效。">
                    <el-select v-model="value" placeholder="Select" style="width: 240px">
                        <el-option-group v-for="group in options" :key="group.label" :label="group.label">
                            <el-option v-for="item in group.options" :key="item.value" :label="item.label"  :value="item.value" >
                               <div class="optionContentBox">
                                 <img src="http://115.190.23.140/static/zhipu.53c4367a.svg"> <span>{{ item.label }}</span>
                               </div>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </el-form-item>


            </el-form>
        </div>
        <div class="bottomBox"></div>
    </div>
</template>

<style lang="scss" scoped>
.kbConfigRoot {
    color: #000;
    width: 100%;
    height: calc(90vh - 100px);
    display: flex;
    flex-direction: column;

    .topBox {
        height: 70%;
        width: 100%;

        .desTitle {
            font-weight: 600;
        }

        .formItemBox {
            width: 48%;
        }
    }

    .bottomBox {
        height: 30%;
        width: 100%;
    }
}
</style>