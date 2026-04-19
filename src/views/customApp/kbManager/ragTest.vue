<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router"
const router = useRouter();

let formObj = ref({
    similarity_threshold: 10,//相似度阈值
    vector_similarity_weight: 20,//向量相似度权重
    use_kg: false,//是否使用知识图谱
    cross_languages: [],//跨语言
});
let cross_languagesOptions = ['English', 'Chinese', 'Spanish', 'French', 'German', 'Japanese', 'Korean'];
let rerankOptions = []
let formatTooltip = (val) => {
    console.log(val)
    return val / 100;
}

let fileList=ref([ {
    count: 10,
    doc_id: 'ce84eddc58a611f080b00242ac120006',
    doc_name: 'TypeScript 快速上手.pdf',
  },
 {
    count: 10,
    doc_id: 'ce84eddc58a611f080b00242ac120006',
    doc_name: 'TypeScript 快速上手.pdf',
  }])
let handleSelectionChange=(e)=>{
    console.log('选中',e)
}
let chunks=ref([])
</script>

<template>
    <div class='ragTestRoot'>
        <div class="leftBox">
            <p class="desTitle">
                <span class="title">检索测试</span>
                <br>
                <br>
                请完成召回测试：确保你的配置可以从数据库召回正确的文本块。如果你调整了这里的默认设置，比如关键词相似度权重，请注意这里的改动不会被自动保存。请务必在聊天助手设置或者召回算子设置处同步更新相关设置。
            </p>
            <el-form label-width="120px" status-icon :model="formObj" label-position="top">
                <!-- <el-form-item label="知识库名称" prop="name" style="width: 100%;">
                    <el-input v-model="formObj.name" />
                </el-form-item> -->
                <el-form-item label="相似度阈值" prop="similarity_threshold">
                    <el-slider v-model="formObj.similarity_threshold" :format-tooltip="formatTooltip" />
                </el-form-item>
                <el-form-item label="相似度权重" prop="vector_similarity_weight">
                    <el-slider v-model="formObj.vector_similarity_weight" :format-tooltip="formatTooltip" />
                </el-form-item>
                <el-form-item label="Rerank模型" prop="">
                    <el-select class="m-2" placeholder="请选择">
                        <el-option v-for="item in rerankOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="使用知识图谱" prop="use_kg" style="width: 100%;">
                    <el-switch v-model="formObj.use_kg" />
                </el-form-item>
                <el-form-item label="跨语言搜索" prop="cross_languages">
                    <el-select multiple v-model="formObj.cross_languages" class="m-2" placeholder="请选择">
                        <el-option v-for="item in cross_languagesOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="测试文本" prop="question">
                    <el-input v-model="formObj.question" :rows="4" type="textarea" placeholder="请输入您的问题" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">测试</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="rightBox">
            <div class="fileBox">
                <el-collapse accordion>
                    <el-collapse-item name="1">
                        <template #title>
                            <p class="header"><span>0/1</span><p style="height: 100%;width: 5%;"></p><span>选定文件</span></p>
                        </template>
                        <el-table :data="fileList" max-height="200" style="width: 100%" @selection-change="handleSelectionChange">
                            <el-table-column type="selection" width="55" />
                            <el-table-column prop="doc_name" label="文件名"  />
                            <el-table-column prop="count" label="热度" width="100" />
                            <el-table-column label="操作" width="80">
                                 <el-button size="small" @click="handleEdit(scope.$index, scope.row)"><el-icon><View /></el-icon></el-button>
                            </el-table-column>
                        </el-table>
                    </el-collapse-item>
                </el-collapse>
            </div>
            <div class="chunkBox">
                <ul>
                    <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                     <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                     <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                     <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                     <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                     <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                     <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                     <li>
                        <p class="header"> 
                            <span class="num">91.15</span> <span class="txt">混合相似度</span>
                            <span class="num">100.00</span> <span class="txt">关键词相似度</span>
                            <span class="num">70.51</span> <span class="txt">向量相似度</span>
                        </p>
                        <div class="content">
TypeScript 快速上⼿⼀、TypeScript 简介tiany三、编译TypeScript. 命令⾏编译. ⾃动化编译四、类型声明五、类型推断六、类型总览七、常⽤类型与语法. any . unknown . never . void . object . tuple . enum . type. ⼀个特殊情况. 复习类相关知识. 属性修饰符. 抽象类. interface（接⼝）. ⼀些相似概念的区别.. interface 与type 的区别.. interface 与抽象类的区别
                        </div>
                    </li>
                </ul>
                 
            </div>
             <el-pagination style="margin-top:20px;"  small background layout="prev, pager, next" :total="1000" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.ragTestRoot {
    color: #000;
    width: 100%;
     height: calc(90vh - 100px);
     overflow: hidden;
    display: flex;
    justify-content: center;

    .leftBox {
        width: 40%;
        height: 100%;
        overflow: hidden;
        overflow-y: scroll;
        box-sizing: border-box;
        padding: 0 20px;

        .desTitle {
            font-size: 14px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 20px;

            .title {
                font-size: 16px;
                font-weight: 600;
            }
        }
    }

    .rightBox {
        display: flex;
        flex-direction: column;
        width: 60%;
        height: 100%;
        padding: 10px 50px;
        box-sizing: border-box;

        .fileBox {
            padding: 0 10px;
            border: 1px solid #F0F0F0;
            border-radius: 10px;

            .header {
                width: 100%;
                height: 40px;
                background-color: #FAFAFA;
                border-bottom: 1px solid #F0F0F0;
                padding: 0 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .fileListBox{

            }
        }
        .chunkBox{
            height: 0;
            flex: 1;
            overflow: hidden;
            overflow-y: scroll;
            ul{
                padding: 0;
                li{
                    margin-top: 20px;
                    border: 1px solid #F0F0F0;
                    border-top-left-radius: 10px;
                    border-top-right-radius: 10px;
                    list-style: none;
                    .header{
                        height: 40px;
                        display: flex;
                        align-items: center;
                        padding: 0 20px;
                        border-bottom: 1px solid #F0F0F0;
                        .num{
                            margin-left: 10px;
                        }
                        .txt{
                            margin-left: 4px;
                            font-weight: 600;
                        }
                    }
                    .content{
                        padding: 5px 20px;
                    }
                }
            }
        }
    }

}
</style>