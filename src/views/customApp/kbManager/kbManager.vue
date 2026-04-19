<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute, RouterView, RouterLink } from "vue-router"
const router = useRouter();

let cutPage = (page) => {
    router.replace(page)
}
</script>

<template>
    <div class='kbManagerRoot'>
        <div class="leftBox">
            <div class="topBox">
                <img src="/imgs/defaultChatAssistant.png" alt="">
                <p class="kbName">手册管理</p>
            </div>
            <div class="bottomBox">
                <ul>
                    <!-- <li><RouterLink active-class="curentLink" to="/dataSet">数据集</RouterLink></li>
                <li><RouterLink active-class="curentLink" to="/ragTest">检索测试</RouterLink></li>
                <li><RouterLink active-class="curentLink" to="/kbConfig">配置</RouterLink></li> -->
                    <li class="curentLink">数据集</li>
                    <li>检索测试</li>
                    <li>配置</li>
                </ul>
            </div>
        </div>
        <div class="rightBox">
            <RouterView></RouterView>
        </div>
    </div>
</template>

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
}

.kbManagerRoot {
    width: 100%;
    height: 100%; // calc(100vh - 84px);
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .leftBox {
        width: 15vw;
        height: 100%;
        // border-right: 1px solid #ccc;

        .topBox {
            height: 150px;
            width: 100%;
            overflow: hidden;
            border-bottom: 1px solid #ccc;

            img {
                display: block;
                margin: 0 auto;
                margin-top: 20px;
                height: 3vw;
                width: 3vw;
            }

            .kbName {
                margin-top: 30px;
                text-align: center;
                font-weight: 600;
            }
        }

        .bottomBox {
            width: 100%;
            padding: 0.5vw 0.8vw;

            ul {
                li {
                    cursor: pointer;
                    list-style: none;
                    height: 40px;
                    margin-top: 10px;
                    background-color: #faf9f9;
                    border-radius: 0.4vw;
                    padding: 0 0.4vw;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    font-size: 0.8vw;

                }

                .curentLink {
                    background-color: #ECF2FE;
                }
            }
        }
    }

    .rightBox {
        width: 85vw;
        height: 100%;
        background-color: rebeccapurple;
    }
}
</style>