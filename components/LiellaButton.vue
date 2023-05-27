<template>
  <b-button pill :variant="variant" :href="href" :to="to" :target="href&&'_blank'" block class="liella-button" :size="size" :disabled="disabled">{{label||title}}</b-button>
</template>

<script>
export default {
    name:"liella-button",
    props:{
        variant:{
            type:String,
            default:"secondary"
        },
        label:{
            type:String,
            default:""
        },
        title:{
            type:String,
            default:""
        },
        to:{
            type:String
        },
        href:{
            type:String
        },
        disabled:{
            type:Boolean,
            default:false
        },
        size:{
            type:String,
            default:"md"
        }
    }
}
</script>

<style lang="scss" scoped>
// .liella-button{
//     width: 100%;
//     height: 100%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
// }
</style>