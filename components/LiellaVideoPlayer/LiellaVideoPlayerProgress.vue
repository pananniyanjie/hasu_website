<template>
    <div :class="{'liella-video-player-progress':true,'seeking':seeking}" ref="progress" :style="{height:height.toString()+(typeof height == 'number' ? 'px' : '')}" @mousedown="mouseDown" @touchstart="mouseDown" @click.stop @dblclick.stop>
        <div class="liella-video-player-progress-buffered" v-for="index in buffered?buffered.length:0" :key="index" :style="{left:((buffered.start(index-1)/max)*100)+'%',width:(((buffered.end(index-1)-buffered.start(index-1))/max)*100)+'%'}"></div>
        <div class="liella-video-player-progress-played" :style="{left:'0px',width:((((seeking?seek:value)-min)/(max-min))*100)+'%','background-color':progressdColor}"></div>
    </div>
</template>

<script>

export default {
    name:"liella-video-player-progress",
    props:{
        max:{
            type:Number,
            default:100
        },
        min:{
            type:Number,
            default:0
        },
        value:{
            type:Number,
            default:0
        },
        height:{
            type:[String,Number],
            default:5
        },
        buffered:{
            type:TimeRanges
        },
        'progressd-color':{
            type:String,
            default:'#6c757d'
        }
    },
    data(){
        return {
            seeking: false,
            seek:0
        }
    },
    watch:{
        value(){
            if(!this.seeking) this.seek=this.value;
        }
    },
    methods:{
        seekTo(e){
            if(this.seeking&&e){
                // console.log(e)
                var seek=typeof e == 'number' ? e : (((typeof e.pageX == 'number'?e.pageX:e.changedTouches[0].pageX)-this.$refs['progress'].getBoundingClientRect().left)/this.$refs['progress'].offsetWidth)*(this.max-this.min)+this.min;
                if(seek>=this.min&&seek<=this.max) this.seek=seek;
                else if(seek>this.max) this.seek=this.max;
                else if(seek<this.min) this.seek=this.min;
                this.$emit('seek',this.seek)
            }
        },
        seekCancel(){
            this.seek=this.value;
        },
        mouseDown(){
            this.seeking=true;
            window.addEventListener("mousemove",this.mouseMove);
            window.addEventListener("touchmove",this.mouseMove);
            window.addEventListener("mouseup",this.mouseUp);
            window.addEventListener("touchend",this.mouseUp);
            window.addEventListener("blur",this.seekCancel);
            window.addEventListener("touchcancel",this.seekCancel);
        },
        mouseMove(e){
            this.seekTo(e);
        },
        mouseUp(e){
            this.seekTo(e);
            window.removeEventListener("mousemove",this.mouseMove);
            window.removeEventListener("touchmove",this.mouseMove);
            window.removeEventListener("mouseup",this.mouseUp);
            window.removeEventListener("touchend",this.mouseUp);
            window.removeEventListener("blur",this.seekCancel);
            window.removeEventListener("touchcancel",this.seekCancel);
            if(this.seek!=this.value){
                this.$emit('change',this.seek)
            }
            this.seeking=false;
        }
    }
}
</script>

<style lang="scss" scoped>
.liella-video-player-progress{
    background-color: rgba($color: #FFFFFF, $alpha: 0.5);
    position: relative;
    cursor: pointer;
    // transition: opacity 0.1s ease-in-out;
    opacity: 0.75;

    &:hover,
    &:focus,
    &.seeking{
        opacity: 1;
    }

    >*{
        height: 100%;
        position: absolute;
    }

    // .liella-video-player-progress-played{
    //     background-color: rgba($color: #6c757d, $alpha: 1.0);
    // }

    .liella-video-player-progress-buffered{
        background-color: rgba($color: #FFFFFF, $alpha: 0.5);
    }
}
</style>