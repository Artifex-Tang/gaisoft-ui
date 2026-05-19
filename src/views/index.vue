<template>
  <div class="root">

    <div class="title">欢迎使用DARPA智能问答服务工具</div>
    <div class="navImgBox">
      <img :class="{ 'imgFiler': item.flag === false}" v-for="(item,index) in navInfoList" :key="index" :src="item.img" @click="openNav(item)"/>
    </div>
    <div class="descript">
      DARPA智能问答服务工具是一款面向国防领域的离线智能问答平台，旨在突破多源异构数据整合瓶颈，通过融合结构化知识管理与检索增强生成技术，为DARPA文档分析与知识获取提供高效精准的智能支持。系统采用"外挂知识库—RAG检索增强—交互式提示"三级架构设计，包含三大核心模块：外挂知识库模块实现非结构化军事文档的深度加工与语义化重构，支持多源异构数据的统一接入与结构化管理；RAG文档检索增强模块基于成熟框架进行领域适配，构建多文本特征融合的混合检索体系，实现高精度的语义匹配与知识召回；交互式提示词工程模块通过动态模板引擎与结构化约束机制，实现用户意图、提问方式与DARPA文档知识的精准对齐。系统具备高精度领域适应能力，支持离线部署，确保敏感数据安全可控，显著提升军事文档分析与决策支持效率。
    </div>
  </div>
</template>

<script setup name="Index">
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus'
  import { ref, onMounted, nextTick } from "vue";
  import useUserStore from "@/store/modules/user";
  import tab from '@/plugins/tab'
  let userInfo = useUserStore();
  let permissions=userInfo.permissions;
  console.log(permissions,'--------------');

  let navInfoList=ref([])
  onMounted(()=>{
    navInfoList.value=[
      {
        img:'/imgs/home/c.png',
        permissionsPath:"ops_solutions",
        path:'ops_solutions',
        flag:false,
      },
      {
        img:'/imgs/home/g.png',
         permissionsPath:"fault_tracing",
        path:'fault_tracing',
         flag:false,
      },
      {
        img:'/imgs/home/m.png',
         permissionsPath:"model",
        path:'assistant/model',
         flag:false,
      },
      {
        img:'/imgs/home/s.png',
         permissionsPath:"manual",
        path:'assistant/manual',
         flag:false,
      }
    ]

    if(permissions.length==1 && permissions[0]=='*:*:*'){
       for(let item of navInfoList.value){
       item.flag=true
      }
    }
    else{
      for(let item of navInfoList.value){
      if(permissions.includes(item.permissionsPath)){
          item.flag=true
        }
      }
    }
    
    
  })

  let openNav=(obj)=>{
    if(obj.flag){
      //tab.openPage(`assistant/${obj.path}`)
      tab.openPage(`${obj.path}`)
    }
    else{
      ElMessage.error('您没有权限访问该页面')
      return false;
    }
  }
</script>

<style scoped lang="scss">
.root {
  width: 100%;

  // height: calc(100vh - 84px);
  // display: flex;
  // align-items: center;
  // justify-content: center;
  .title {
    font-size: 2.5vw;
    text-align: center;
    font-weight: 700;
    color: #3E71BD;
    margin-top: 10vh;
  }

  .navImgBox {
    width: 50vw;
    margin: 0 auto;
    margin-top: 4vh;
    display: flex;
    align-items: center;
    justify-content: space-around;
    img{
      cursor: pointer;
      display:block;
      width: 10vw;
    }
    .imgFiler{
      //设置灰度
      filter: grayscale(100%);
    }
  }

  .descript {
    text-indent: 2vw;
    margin: 0 auto;
    margin-top: 5vh;
    line-height: 3.4vh;
    width: 50vw;
    font-size: 1vw;
    color: #747474;
  }

  // .homeImg{
  //   width:50%;
  //   height: auto;
  //   display: block;
  // }
}
</style>
