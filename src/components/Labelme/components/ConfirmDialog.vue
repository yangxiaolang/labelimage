<template>
    <div v-if="dialogVisible"
         class="dialogDiv"
         :style="{top,left}"
         style="border: 1px solid #d9d9d9;background: rgba(230, 231, 232, 0.6);border-radius: 10px;">
      <div style="position: absolute;bottom:10px;right: 10px;">
        <el-button @click="cancel">{{ $t('permission.cancel') }}</el-button>
        <!-- <el-button type="primary"
                             @click="confirm">{{$t('permission.confirm')}}</el-button> -->
      </div>
    </div> 
</template>
<script>
export default {
    name:'',
    props:{
        top:[Number,String],
        left:[Number,String],
        graph:Object,
        dialogVisible:Boolean
    }
}
</script>
<style scoped>

</style>