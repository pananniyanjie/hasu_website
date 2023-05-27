<template>
  <div class="liella-banner banner hidden-xs hidden-sm" :style="{'background-image': 'url('+src+')'}">
      <div>
          <slot />
      </div>
  </div>
</template>

<script>
export default {
    name:'liella-banner',
    props:{
        src:{
            type:String,
            require:true
        }
    }
}
</script>

<style lang="scss" scoped>
.banner {
    background-size: 100% auto;
    background-position: top;
    background-color: #efefef;
    background-repeat: no-repeat;
    position: relative;
    z-index: -1;
    padding-bottom: 25%;
    >div{
        position: absolute;
        left: 0px;
        right: 0px;
        bottom: 0px;
        top: 0px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 1em;
    }
}
</style>