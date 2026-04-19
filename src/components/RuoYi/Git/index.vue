<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://www.test.com/01.html');

function goto() {
  window.open(url.value)
}
</script>
