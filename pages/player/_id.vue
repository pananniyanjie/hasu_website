<template>
    <div class="liella-player">
        <liella-banner :src="banner"></liella-banner>
        <b-container fluid="lg" tag="main" class="px-0 pt-lg-5">
            <div class="video-card mb-lg-2">
                <liella-video-player 
                    ref="player" 
                    :id="data.id" 
                    :danmakus="danmakus" 
                    :poster="data.poster" 
                    :src="data.url" 
                    :title="data.title"
                    :danmaku-rule="$md.render(danmakuRule)"
                    @senddanmaku="sendDanmaku"
                    @blockdanmaku="blockDanmaku"
                    @complaindanmaku="complainDanmaku"
                    @report="report"
                    :blocked-danmakus="blockedDanmakus"
                    ></liella-video-player>
            </div>
            <div class="liella-danmaku-list">
            <b-tabs content-class="tab-content" style="height:100%" active-nav-item-class="active-tab" justified no-nav-style>
                <b-tab title="简介" active>
                    <b-container>
                       <div class="py-2 mt-4" v-html="$md.render(data.description)"></div> 
                    </b-container>
                </b-tab>
                <b-tab title="弹幕列表">
                    <ve-table 
                        :border-around="false" 
                        :border-x="false"
                        :border-y="false" 
                        :columns="danmakuColumns" 
                        :table-data="danmakus" 
                        :virtual-scroll-option="virtualScrollOption" 
                        :sort-option="sortOption" 
                        :cell-style-option="cellStyleOption" 
                        maxHeight="100%" 
                        :style="{'word-break':'break-word',height:'100%'}" 
                        rowKeyFieldName="cid" />
                </b-tab>
            </b-tabs>
                
            </div>
            
            <!-- <RecycleScroller
                class="liella-danmaku-list"
                :items="danmakus"
                :item-size="32"
                key-field="cid"
                v-slot="{ item }"
                page-mode
            >
                <div class="user">
                {{ item }}
                </div>
            </RecycleScroller> -->
        </b-container>
        <b-modal hide-footer id="complainDanmaku" @hidden="cancelComplain">
            <template #modal-title>
                举报<b>{{selectedDanmaku.text}}</b>
            </template>
            <div class="d-block text-center">
                <h3>请选择举报理由</h3>
                <div class="my-4" v-for="index in Math.ceil(data.complain.reasons.length/3)" :key="index">
                    <b-button-group size="lg">
                        <b-button v-if="data.complain.reasons[(index-1)*3+0]" @click="confirmComplain(data.complain.reasons[(index-1)*3+0])">{{data.complain.reasons[(index-1)*3+0]}}</b-button>
                        <b-button v-if="data.complain.reasons[(index-1)*3+1]" @click="confirmComplain(data.complain.reasons[(index-1)*3+1])">{{data.complain.reasons[(index-1)*3+1]}}</b-button>
                        <b-button v-if="data.complain.reasons[(index-1)*3+2]" @click="confirmComplain(data.complain.reasons[(index-1)*3+2])">{{data.complain.reasons[(index-1)*3+2]}}</b-button>
                    </b-button-group>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import createAxios from '../../actions/createAxios'
export default {
    asyncData({ route , store , error }) {
        // console.log(route);
        var manifest = store.getters.getManifest;
        // for (const path in manifest.rules) {
        // if (Object.hasOwnProperty.call(manifest.rules, path)) {
        //     const target = manifest.rules[path];
        //     const matcher = match('/rules/'+path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"));
        //     const matchResult = matcher(route.path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"));
        //     // console.log('/rules/'+path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"),route.path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"),matchResult,route.path)
        //     if(matchResult){
            // console.log((process.server&&store.getters.getManifest.baseURL.indexOf('http')!=0?process.env.baseURL:'')+store.getters.getManifest.baseURL+toPath(matchResult.params))
            return createAxios(manifest.videos,{
                params:route.params,
                baseURL:(process.server&&store.getters.getManifest.baseURL.indexOf('http')!=0?process.env.baseURL:'')+store.getters.getManifest.baseURL
            }).then((result)=>{
                // route.params.page=result.data;
                // this.page=result.data
                return {
                    data:result.data,
                };
            }).catch(e=>{
                console.error(e)
                error({
                    statusCode:e.response.status,
                    message:e.response.data||e.stack
                })
            });
            // }
        // }
        // }
        // error({statusCode:404,message:"Page not found"})
    },
    head() {
        return this.data.heads||{title:this.data.title}
    },
    data(){
        return {
            Math:Math,
            banner:'/image/banner.jpg',
            danmakus:[],
            data:{
                title:"",
                description:"",
                next:null,
                danmaku:null,
                url:'',
                poster:'',
                id:''
            },
            danmakuRule:'',
            danmakuColumns:[
                        {
                            field: "time", 
                            key: "a", 
                            title: "时间", 
                            width: "20%",
                            sortBy: "asc",
                            renderBodyCell: ({ row, column, rowIndex }, h) => {
                                const text = this.parseTime(row[column.field]);
                                return(
                                    <span>{text}</span>
                                )
                            }
                        },
                        {field: "text", key: "b", title: "内容",width: "40%"},
                        {
                            field: "color",
                            key: "c",
                            title: "颜色",
                            align: "center",
                            width: "20%",
                            renderBodyCell: ({ row, column, rowIndex }, h) => {
                                const text = row[column.field]||'#FFFFFF';
                                const style = 'background-color:'+text+';width:1em;height:1em;display:inline-block;margin:auto 0.5em; border: 1px solid #000000;';
                                return (
                                    <div>
                                    <span style={style}></span>
                                    <span class="text-bold">
                                        {text}
                                    </span>

                                    </div>
                                );
                            },
                        },
                        {
                            field: "cid",
                            key: "d",
                            title: "操作",
                            align: "center",
                            width: "20%",
                            renderBodyCell: ({ row, column, rowIndex }, h) => {
                                return (
                                    <b-button-group size="sm">
                                        <b-button class="text-nowrap" size="sm" onclick={()=>{
                                            this.copyDanmaku(row)
                                        }}>复制</b-button>
                                        <b-button class="text-nowrap" size="sm" variant="outline-secondary" onclick={()=>{
                                            this.blockDanmaku(row)
                                        }}>屏蔽</b-button>
                                        <b-button class="text-nowrap" size="sm" variant="outline-secondary" onclick={()=>{
                                            this.complainDanmaku(row)
                                        }}>举报</b-button>
                                    </b-button-group>
                                );
                            },
                        },
                    
            ],
            virtualScrollOption: {
                // 是否开启
                enable: true,
                scrolling: this.scrolling,
            },
            sortOption: {
                sortChange: (params) => {
                    // console.log("sortChange::", params);
                    this.sortChange(params);
                },
            },
            cellStyleOption: {
                headerCellClass: ({ column, rowIndex }) => {
                    // if (rowIndex === 0) {
                    //     return "table-header-cell-class title";
                    // }
                    return "table-header-cell-class";
                },
            },
            blockedDanmakus: JSON.parse(window.localStorage.getItem('liella-video-player-blocked-danmakus'))||[],
            selectedDanmaku:null
        }
    },
    watch:{
        blockedDanmakus(){
            window.localStorage.setItem('liella-video-player-blocked-danmakus',JSON.stringify(this.blockedDanmakus));
        }
    },
    methods:{
        sendDanmaku(danmaku){
            // console.log(danmaku);
            var data = {
                color:danmaku.color,
                time:danmaku.time,
                type:danmaku.position,
                text:danmaku.text
            };
            createAxios(this.data.danmaku.send,{
                data:data,
                params:data,
                baseURL:this.$store.getters.getManifest.baseURL
            }).then(result=>{
                this.$refs['player'].hideOverlayer(true);
                this.$refs['player'].clearEditedDanmaku();
                this.$refs['player'].sendDanmaku(danmaku);
            }).catch(e=>{
                console.error(e);
                var error = e.toString();
                if(e.response&&e.response.data){
                    if(e.response.data.msg){
                        error=e.response.data.msg
                    }else{
                        error=e.response.data
                    }
                }
                this.$refs['player'].hideOverlayer(true);
                this.$refs['player'].sendMessage({
                    text:'弹幕发送失败：'+error
                })
            })
        },
        copyDanmaku(danmaku){
            this.$copyText(danmaku.text)
                .then(()=>{
                    this.$bvToast.toast(
                        danmaku.text,
                        {
                            title:'复制成功！',
                            autoHideDelay: 5000,
                            appendToast:true
                        }
                    )
                })
                .catch(()=>{
                    this.$bvToast.toast(
                        danmaku.text,
                        {
                            title:'复制失败！',
                            autoHideDelay: 5000,
                            appendToast:true
                        }
                    )
                })
        },
        blockDanmaku(danmaku){
            this.blockedDanmakus.push(danmaku['cid'])
            this.$refs['player'].blockDanmaku(danmaku['cid'])
        },
        complainDanmaku(danmaku){
            // console.log(danmaku)
            this.selectedDanmaku=danmaku;
            this.$bvModal.show('complainDanmaku')
        },
        cancelComplain(){
            // console.log('cancelComplain')
            this.selectedDanmaku=null;
            this.$bvModal.hide('complainDanmaku')
        },
        confirmComplain(type){
            this.blockDanmaku(this.selectedDanmaku);
            createAxios(this.data.complain.request,{
                params:{
                    _:(new Date()).valueOf(),
                    cid:this.selectedDanmaku.cid,
                    type:type
                },
                baseURL:this.$store.getters.getManifest.baseURL
            }).then(result=>{
                this.$bvToast.toast(
                    (result.data.danmaku||result.data.danmuku||result.data).toString(),
                    {
                        title:'提示',
                        autoHideDelay: 5000,
                        appendToast:true
                    }
                );
                this.$bvModal.hide('complainDanmaku');
                this.$refs['player'].hideOverlayer(true);
            }).catch(e=>{
                var error = e.toString();
                if(e.response&&e.response.data){
                    if(e.response.data.msg){
                        error=e.response.data.msg
                    }else{
                        error=e.response.data
                    }
                }
                this.$bvToast.toast(
                    '举报失败：'+error,
                    {
                        title:'提示',
                        autoHideDelay: 5000,
                        appendToast:true
                    }
                )
            })
        },
        parseTime(seconds){
            return Math.floor(seconds/60) +':' + (Array(2).join(0)+Math.floor(seconds%60)).slice(-2)
        },
        sortChange(params) {
            this.danmakus.sort((a, b) => {
                if (params.time) {
                    if (params.time === "asc") {
                        return a.time - b.time;
                    } else if (params.time === "desc") {
                        return b.time - a.time;
                    } else {
                        return 0;
                    }
                }
            });
        },
        getDanmakus(){
            createAxios(this.data.danmaku.get,{
                params:{
                    _:(new Date()).valueOf()
                },
                baseURL:this.$store.getters.getManifest.baseURL
            }).then(result=>{
                var danmaku =[]
                var data = result.data instanceof Array ? result.data : result.data.danmakus || result.data.danmuku
                for (const index in data) {
                    if (Object.hasOwnProperty.call(data, index)) {
                        const value = data[index];
                        if(typeof value == 'object'){
                            if(value instanceof Array){
                                danmaku.push({
                                    time:value[0],
                                    position:value[1]=='right'?'move':value[1],
                                    color:value[2],
                                    cid:value[3]||"random-"+Math.random()*10000,
                                    text:value[4],
                                    datetime:value[6]
                                })
                            }else{
                                danmaku.push(value)
                            }
                        }else{
                            var time = danmaku[danmaku.length-1]?danmaku[danmaku.length-1].time+1:0
                            danmaku.push({
                                time:time,
                                position:'move',
                                color:'#FFFFFF',
                                cid:0,
                                text:value.toString(),
                                datetime:'unknown'
                            })
                        }
                    }
                }
                this.danmakus=danmaku
            })
        },
        report(){
            // console.log('report')
            if(this.data.report){
                if(this.data.report.link){
                    window.open(this.data.report.link,'_blank');
                }else if(this.data.report.to){
                    this.$router.push(this.data.report.to)
                }
            }
            
        }
    },
    mounted(){
        // console.log(this);
        // this.$axios.defaults.baseURL=this.$store.getters.getManifest.baseURL;
        // this.data.danmaku.params.ac="dm";
        this.getDanmakus();
        this.$store.getters.getManifest.rules
        &&this.$store.getters.getManifest.rules.danmaku
        &&this.$axios.get(this.$store.getters.getManifest.rules.danmaku).then((result)=>{
            this.danmakuRule=result.data
        })
    }
}
</script>

<style lang="scss" scoped>
.liella-player{
    position: relative;
    top: 0px;
    left: 0px;
    right: 0px;
    display: flex;
    flex-direction: column;
    
    .liella-banner{
        position: absolute;
        width: 100%;
        height: 200px;
    }

    main{
        top: 0px;
        left: 0px;
        right: 0px;
        display: flex;
        flex-direction: column;
        height: 100%;
        flex: 1;

        .video-card{
            top: 0px;
            // position: sticky;
            background-color: #FFFFFF;
            overflow: hidden;
            z-index: 1;

            @media (min-width: 992px){
                border-radius: 5px;
                box-shadow: 0 0.5rem 1rem rgba($color: #000000, $alpha: 0.15)
            }
        }
        .liella-danmaku-list{
            z-index: 0;
            flex: 1;
            min-height: 320px;
            background-color: #FFFFFF;
        }
    }
}
.tabs{
    display: flex;
    flex-direction: column;

    .tab-content{
        flex: 1;
    }
}
</style>

<style lang="scss">

.table-header-cell-class {
    background: #FFFFFF !important;

    &.title{
        font-size: 1.25em !important;
        // font-weight: 500 !important;
    }
}
.tabs{
    .tab-content{
        flex: 1;
        .tab-pane.active{
            height: 100%;
        }
    }
    .active-tab{
        border-bottom: 2px solid;
    }
}
</style>