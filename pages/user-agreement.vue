<template>
    <div class="bg-white">
        <b-container class="p-4">
            <div v-html="$md.render(agreement)" @click.prevent="click"></div>
            <div class="py-4">
                <b-button @click="allow">同意并继续</b-button>
                <b-button @click="notAllow" id="exit">不同意并退出</b-button>
                <b-tooltip ref="exit-tooltip" target="exit" triggers="click blur">
                    浏览器不支持自动关闭网页，请手动关闭！
                </b-tooltip>
            </div>
        </b-container>
    </div>
</template>

<script>
import createAxios from '../actions/createAxios'
export default {
    asyncData({ route , store , error }) {
        return createAxios(store.getters.getManifest["user-agreement"],{
            baseURL:(process.server&&store.getters.getManifest.baseURL.indexOf('http')!=0?process.env.baseURL:'')+store.getters.getManifest.baseURL
        }).then((result)=>{
            // route.params.data=;
            return {agreement:result.data};
        }).catch(e=>{
            error({
                statusCode:e.response.status,
                message:e.stack
            })
        });
    },
    data(){
        return {
            agreement:""
        }
    },
    // mounted(){
    //     this.agreement=this.$route.params.data
    // },
    methods:{
        click(e){
            if(e.target.nodeName=="A"){
                if(e.target.origin==window.location.origin) this.$router.push(e.target.pathname);
                else window.open(e.href,'_blank');
            }
        },
        allow(){
            this.$cookies.set("agreement-agreed",true,{
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            });
            // console.log(this.$store.getters.getRedirectFrom)
            this.$router.replace(this.$store.getters.getRedirectFrom||'/');
        },
        notAllow(){
            this.$store.commit("setExit", true);
            this.$router.back();
        }
    }
}
</script>

<style>

</style>