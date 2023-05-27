<template>
  <component v-bind:is="href?'a':'div'" :class="{'member':true,'scale-inside':scaleInside}" :style="{'box-shadow': '0 0 5px '+color}" :href="href" :title="title" target="_blank">
      <div :style="{'background-image':'url('+image+')'}"></div>
  </component>
</template>

<script>
export default {
    name:'liella-member-card',
    props:{
        image:{
            type:String,
            require:true
        },
        color:{
            type:String,
            require:true
        },
        href:String,
        scaleInside:{
            type: Boolean,
            default: true
        },
        title:String
    }
}
</script>

<style lang="scss" scoped>
.member {
    padding-bottom: 54.5%;
    margin-bottom: 20px;
    border-radius: 5px;
    display: inline-block;
    z-index: 3;
    width: 100%;
    height: auto;
    position: relative;
    overflow: hidden;
    transition: all .2s ease;
    div{
        background-position: center;
        background-size: 100%;
        position: absolute;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
        transition: all .2s ease;
    }
    &.scale-inside{
        &:hover {
            div{
                transform: scale(1.15);
            }
        }

        &:active {
            div{
                transform: scale(1.07);
            }
        }
    }
    &:not(.scale-inside){
        &:hover {
            transform: scale(1.05);
        }

        &:active {
            transform: scale(1.02);
        }
    }

    
}
</style>