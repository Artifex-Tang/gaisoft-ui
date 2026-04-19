<template>
  <div class="root">

    <div class="title">欢迎使用装备综合保障智能问答系统</div>
    <div class="navImgBox">
      <img :class="{ 'imgFiler': item.flag === false}" v-for="(item,index) in navInfoList" :key="index" :src="item.img" @click="openNav(item)"/>
    </div>
    <div class="descript">
      装备综合保障智能问答系统是一款基于人工智能技术的专业化问答平台，旨在为装备维护、后勤保障等场景提供高效精准的智能支持。系统通过自然语言处理(NLP)技术理解用户关于装备技术参数、故障诊断、维修流程、备件调配等领域的提问，并依托知识图谱和行业数据库生成即时解答。可覆盖装备全生命周期管理需求，支持多模态交豆(文本、语音、图像识别)，具备自学能力以持续优化答案准确性。同时集成权限管理机制，确保敏感数据安全，显著提升装备保障效率并降低人工服务成本。
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
