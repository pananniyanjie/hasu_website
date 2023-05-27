<template>
    <div class="liella-video-player-selector" @click.stop @dblclick.stop>
        <button :class="{'liella-video-player-selector-item':true,'liella-video-player-selector-item-selected':typeof selected != 'undefined'&&selected.toString()==index.toString()}" :style="{'width':average?((1/length)*100+'%'):'auto'}" v-for="(item,index) in list" :key="index" @click.prevent="click($event,index)">{{item}}</button>
    </div>
</template>

<script>
export default {
    name:"liella-video-player-selector",
    props:{
        list:{
            type:Object,
            required:true
        },
        selected:{
            // type:Number
        },
        average:{
            type:Boolean,
            default:false
        }
    },
    data(){
        return {
            length:0
        }
    },
    methods:{
        click($event,index){
            $event.target.blur();
            this.$emit('selected',(typeof this.selected == 'string' || typeof this.selected == 'undefined')?index:eval(index))
        }
    },
    mounted(){
        this.length=this.list.length||Object.keys(this.list).length;
    }
}
</script>

<style lang="scss" scoped>
.liella-video-player-selector{
    display: flex;
    height: 4em;
    justify-content: center;
    align-items: center;

    .liella-video-player-selector-item{
        // border: 1px solid #FFFFFF;
        // border-left-width: 0px;
        // border-radius: 5px;
        padding: 1em;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        flex: 1;
        border: none;
        border-bottom: 2px solid transparent;
        // margin: auto 0.25em;
        background-color: transparent;
        color: rgba($color: #FFFFFF, $alpha: 0.5);
        text-align: center;
        white-space: nowrap;
        word-break: keep-all;
        

        // &:first-of-type{
        //     border-top-left-radius: 5px;
        //     border-bottom-left-radius: 5px;
        //     border-left-width: 1px;
        // }

        // &:last-of-type{
        //     border-top-right-radius: 5px;
        //     border-bottom-right-radius: 5px;
        // }
        &.liella-video-player-selector-item-selected{
            // background-color: #FFFFFF;
            // color: #000000;
            font-weight: 700;
            // font-size: 2em;
            color: #FFFFFF;
            // &:hover,
            // &:focus{
            //     // font-weight: 700;
            //     border-bottom-color: #FFFFFF;
            // }
        }

        // &.liella-video-player-selector-item-selected,
        &:hover,
        &:focus{
            // border-bottom-color: #FFFFFF;
            // padding: 0.5em 1em;
            // transform: scale(2);
            font-size: 2em;
            color: #FFFFFF;
            
        }
    }
}
</style>