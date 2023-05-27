<template>
    <div class="bg-white">
        <b-container v-html="$md.render(data)" class="p-4" @click.prevent="click"></b-container>
    </div>
</template>

<script>
import { match } from 'path-to-regexp';
import createAxios from '../../../actions/createAxios'
export default {
  asyncData({ route , store , error }) {
    // console.log(arguments[0]);
    var manifest = store.getters.getManifest;
    for (const path in manifest.rules) {
      if (Object.hasOwnProperty.call(manifest.rules, path)) {
        const target = manifest.rules[path];
        const matcher = match('/rules/'+path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"));
        const matchResult = matcher(route.path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"));
        // console.log('/rules/'+path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"),route.path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"),matchResult,route.path)
        if(matchResult){
          // console.log((process.server&&store.getters.getManifest.baseURL.indexOf('http')!=0?process.env.baseURL:'')+store.getters.getManifest.baseURL+toPath(matchResult.params))
          return createAxios(target,{
            params:matchResult.params,
            baseURL:(process.server&&store.getters.getManifest.baseURL.indexOf('http')!=0?process.env.baseURL:'')+store.getters.getManifest.baseURL
          }).then((result)=>{
            // route.params.page=result.data;
            // this.page=result.data
            return {
              data:result.data,
            };
          }).catch(e=>{
            // console.error(e)
            error({
              statusCode:e.response.status,
              message:e.response.data||e.stack
            })
          });
        }
      }
    }
    error({statusCode:404,message:"Page not found"})
  },
    data(){
        return {
            data:""
        }
    },
    // mounted(){
    //     this.data=this.$route.params.data
    // },
    methods:{
        click(e){
            if(e.target.nodeName=="A"){
                if(e.target.origin==window.location.origin) this.$router.push(e.target.pathname);
                else window.open(e.href,'_blank');
            }
        }
    }
}
</script>

<style>

</style>