<template>
  <b-card
        :img-src="image"
        :img-alt="title"
        img-top
        class="liella-card"
        :tag="href?'a':to?'nuxt-link':'div'"
        :href="href"
        :target="href&&'_blank'"
        :to="to"
        :overlay="overlay"
        :text-variant="overlay?'white':''"
        :body-class="{'overlay':overlay, 'liella-card-body':true}"
        footer-bg-variant="transparent"
        footer-class="px-0"
        :router-tag="'div'"
    >
        <h5 class="text-truncate" v-if="title">{{title}}</h5>
        <b-card-text :class="['text-break','text-'+(overlay?'truncate':'muted')]" v-if="introduction">
            {{introduction}}
        </b-card-text>
        <template v-slot:footer v-if="links">
            <b-row :cols="links.length<2?links.length:2" :cols-xl="links.length<3?links.length:3" align-content="stretch" no-gutters>
                <b-col class="liella-card-link px-2" v-for="(item,index) in links" :key="index" tag="b-link" :href="item.link" :to="item.to" :disabled="!(item.link||item.to)" :target="'_'+(item.link?'blank':'self')">
                {{item.label||item.title}}
                </b-col>
            </b-row>
        </template>
    </b-card>
</template>

<script>
export default {
    name:'liella-card',
    props:{
        image:{
            type:String
        },
        title:{
            type:String
        },
        href:{
            type:String
        },
        to:{
            type:String
        },
        introduction:{
            type:String
        },
        overlay:{
            type:Boolean,
            default:false
        },
        links:{
            type:Array
        }
    }
}
</script>

<style lang="scss" scoped>
.liella-card{
  transition: border .2s ease-in-out;
  color: inherit;
  width: 100%;
  .overlay.liella-card-body{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0.75em;
    background-image: linear-gradient(to top, rgba($color: #000000, $alpha: 0.5), rgba($color: #000000, $alpha: 0));
  }
  .liella-card-link{
    display: inline-block;
    text-align: center;
  }
}
a.liella-card:hover, a.liella-card:focus {
  border-color: #cca3c8;
}
</style>