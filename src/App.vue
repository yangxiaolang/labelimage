<template>
  <div id="app">
    <labelme></labelme>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import Labelme from './components/Labelme/Labelme.vue'

export default {
  name: 'App',
  components: {
    Labelme
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
