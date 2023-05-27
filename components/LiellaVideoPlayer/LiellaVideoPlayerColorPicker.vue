<template>
  <div class="liella-video-player-color-picker" @click.stop>
      <button v-for="(item,index) in colors" :key="index" :style="{'background-color':item,'border-color':item}" :class="{selected:item==selected}" @click.prevent="$emit('selected',item)"></button>
  </div>
</template>

<script>
export default {
    name:"liella-video-player-color-picker",
    props:{
        colors:{
            type:Array
        },
        selected:{
            type:String
        }
    }
}
</script>

<style lang="scss" scoped>
.liella-video-player-color-picker{
    display: flex;
    flex-wrap: wrap;
    button{
        padding: 0px;
        margin: 0px;
        border: none;
        outline: none;
        width: 20%;
        height: 1.75em;
        transition: all 0.2s ease-in-out;
        position: relative;
        z-index: 0;
        border: 1px solid #FFFFFF;
        // opacity: 0.75;

        &:not(.selected):hover,
        &:not(.selected):focus{
            transform: scale(1.2);
            z-index: 1;
            // opacity: 1;
            box-shadow: 0px 0px 0.5em rgba($color: #000000, $alpha: 0.5);
        }

        &.selected{
            &::before{
                content: "✓";
                color: #FFFFFF;
                background-color: rgba($color: #000000, $alpha: 0.25);
                position: absolute;
                left: 0px;
                right: 0px;
                top: 0px;
                bottom: 0px;
                line-height: 1.75em;
            }
            &:hover,
            &:focus{
                border-width: 2px;
            }
        }
    }
}
</style>