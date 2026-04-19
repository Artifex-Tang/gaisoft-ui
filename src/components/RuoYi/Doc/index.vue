<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('http://www.help.com/01.html');

function goto() {
  window.open(url.value)
}
</script>