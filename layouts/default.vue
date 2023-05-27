<template>
  <div class="liella" @contextmenu.prevent="onContextMenuHandler" @click.capture="showMenu=false">
    <b-navbar class="liella-navbar py-md-0" toggleable="md" :print="true">
        <div class="container liella-container">
            <b-navbar-brand class="liella-navbar-brand">
            <b-img-lazy src="/image/logo.png" alt="LOGO" title="这是星象馆的logo哒"/>
            </b-navbar-brand>
            <b-navbar-toggle target="nav-collapse" class="border-0"></b-navbar-toggle>
            <b-collapse id="nav-collapse" is-nav class="liella-nav-collapse">
                <b-navbar-nav class="ml-auto">
                <b-nav-item to="/" class="liella-navbar-item">
                星象馆主页
                </b-nav-item>
                <b-nav-item href="https://www.lovelive-anime.jp/yuigaoka/" target="_blank" class="liella-navbar-item">
                Liella!官方页面
                </b-nav-item>
<!--
                <b-nav-item-dropdown :text="local" class="liella-navbar-item" menu-class="border-0 liella-navbar-dropdown-menu">
                    <b-dropdown-item v-for="(item,index) in locals" :key="index" :href="item.url">
                        {{item.label||item.title}}
                    </b-dropdown-item>
                </b-nav-item-dropdown>
-->
                <b-nav-item-dropdown text="友情链接" class="liella-navbar-item" menu-class="border-0 liella-navbar-dropdown-menu">
                    <b-dropdown-item v-for="(item,index) in friends" :key="index" :href="item.link" target="_blank">
                        {{item.label||item.title}}
                    </b-dropdown-item>
                </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </div>
        
    </b-navbar>
    <nuxt style="flex:1;" />
    <div class="foot-wrapper">
        <div class="footer container liella-container">
            <p style="margin:0">
                技术支持 By <a href="https://hlkj.wdztbil.top" target="_blank">黑联科技</a>・设计 By <a href="https://weibo.com/icyluna7" target="_blank">@ICYLUNA</a>   
                <span id='cnzz_stat_icon_1280099811'></span><script src='https://s9.cnzz.com/z_stat.php?id=1280099811&show=pic' type='text/javascript'></script>
            </p>
        </div>
    </div>
    <div class="pointerPos" id="pointerPos" :style="{'left':(pointerPos.x-menuOffset)+'px','top':(pointerPos.y-menuOffset)+'px',width:(menuOffset*2)+'px',height:(menuOffset*2)+'px'}"></div>
    <b-popover v-if="showMenu||!menuHidden" custom-class="pointerMenu shadow" target="pointerPos" :show.sync="showMenu" :placement="menuPlacement" title="你点了此处..." @hidden="menuHidden=!!(pointerPos.x=pointerPos.y=0)">
        <div class="my-2"><span v-html="menu.title?menu.title:menu.tips[menu.type]"></span>{{menu.kaomoji||'(∠・ω )⌒☆'}}</div>
        <div class="my-2">
            <div v-if="menu.type=='image'" class="text-center">
                <b-img :src="menu.data" fluid style="max-height:200px;max-width:250px"></b-img>
            </div>
            <div v-else-if="menu.type=='link'" style="max-width:250px">
                链接地址：<a>{{menu.data.url}}</a>
            </div>
            <div v-else-if="menu.type=='selectedText'" style="max-width:250px">
                {{menu.data}}
            </div>
            <div v-else-if="!menu.title&&menu.type!='button'">到处点点试试吧！</div>
        </div>
        <div style="">
            <b-button-group>
                <b-button v-for="(item,index) in (menu.actions[menu.type]||menu.actions['default'])" :key="index" @click="(!!item.function(menu.data,$router)==false)&&(showMenu=false)">{{item.label}}</b-button>
                <b-dropdown right text="更多操作">
                    <template v-for="(item,index) in (menu.otherActions[menu.type]||menu.otherActions['default'])">
                    <b-dropdown-divider v-if="item=='divider'" :key="index"></b-dropdown-divider>
                    <b-dropdown-item v-else :key="index" @click="(!!item.function(menu.data,$router)==false)&&(showMenu=false)">{{item.label}}</b-dropdown-item>
                    </template>
                </b-dropdown>
            </b-button-group>
        </div>
    </b-popover>
    <b-modal ref="qrcode" hide-footer title="扫描二维码" size="sm">
      <div class="d-block text-center">
          <b-img :src="qrcodeBase64" :width="200" :height="200"></b-img>
          <b-form-input v-model="qrcodeUrl" class="mt-2"></b-form-input>
      </div>
      <div class="mt-2">
        <b-row align-v="center">
            <b-col>
                <b-icon icon="exclamation-circle" variant="secondary" id="tooltip-target-qrcode"></b-icon>
                <b-tooltip target="tooltip-target-qrcode" triggers="hover">
                    要扫描此二维码，您可以使用手机上的二维码扫描器应用，也可以使用某些相机应用。
                </b-tooltip>
            </b-col>
            <b-col>
                <div class="text-right">
                    <b-button @click="download(qrcodeBase64)">下载</b-button>
                </div>
            </b-col>
        </b-row>
      </div>
      
      
    </b-modal>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'
var vm;
var menuOptions = {
    back:{
        label:'返回',
        function: function (params,router) {
            router.back()
        }
    },
    forward:{
        label:'前进',
        function: function (params,router) {
            router.forward()
        }
    },
    reload:{
        label:'重新加载',
        function: function (params) {
            location.reload()
        }
    },
    qrcode:{
        label:'为此页面创建二维码',
        function: function (params) {
            vm.qrcodeUrl=location.href;
            vm.$refs['qrcode'].show();
        }
    },
    searchByBaidu:{
        label:'使用百度搜索',
        function: function (params) {
            window.open('//www.baidu.com/s?wd='+params,'_blank');
        }
    },
    searchByGoogle:{
        label:'使用Google搜索',
        function: function (params) {
            window.open('//www.google.com.hk/search?q='+params,'_blank');
        }
    },
}
export default {
    data(){
        return {
            local:'',
            locals:[
                {
                    label:'中国大陆版',
                    url:'//liella.tv/'
                },
                {
                    label:'Intl - 國際版',
                    url:'//intl.liellastar.club/'
                }
            ],
            friends:[],
            pointerPos:{
                x:0,
                y:0
            },
            showMenu:false,
            menu:{
                tips:{
                    default:'我是一个非常有趣的菜单哦',
                    image:'这是一张图片哦',
                    link:'这是一个链接哦',
                    button:'这是一个按钮哦',
                    selectedText:'你选中了一段文本哦'
                },
                type:'default',
                data:null,
                actions:{
                    default:[
                        menuOptions.back,menuOptions.forward,menuOptions.reload
                    ],
                    link:[
                        {
                            label:'访问',
                            function: function (params) {
                                window.open(params.url,params.target);
                            }
                        },
                        menuOptions.back,menuOptions.reload
                    ],
                    button:[
                        {
                            label:'点击',
                            function: function (params) {
                                params.click()
                            }
                        },
                        menuOptions.back,menuOptions.reload
                    ],
                    selectedText:[
                        {
                            label:'复制',
                            function: function (params) {
                                navigator.clipboard.writeText(params);
                            }
                        },
                    ]
                },
                otherActions:{
                    default:[
                        menuOptions.qrcode
                    ],
                    link:[
                        menuOptions.forward,'divider',
                        {
                            label:'复制链接地址',
                            function: function (params) {
                                navigator.clipboard.writeText(params.url);
                            }
                        },
                    ],
                    button:[
                        menuOptions.forward,'divider',menuOptions.qrcode
                    ],
                    selectedText:[
                        'divider',menuOptions.back,menuOptions.forward,menuOptions.reload,'divider',menuOptions.qrcode
                    ]
                },
                title:null,
                kaomoji:null
            },
            qrcodeBase64:'',
            qrcodeUrl:'',
            menuHidden:true,
            touch: false
        }
    },
    computed:{
        menuPlacement(){
            // console.log(this.touch)
            return this.touch?'top':'bottomright'
        },
        menuOffset(){
            // console.log(this.touch)
            return this.touch?15:1
        }
    },
    mounted(){
        vm=this
        this.local=this.locals[+(location.hostname=='intl.liellastar.club')].label
        if(location.hostname=='intl.liellastar.club'){
            this.menu.actions.selectedText.push(menuOptions.searchByGoogle);
            this.menu.otherActions.selectedText.unshift(menuOptions.searchByBaidu);
        }else{
            this.menu.actions.selectedText.push(menuOptions.searchByBaidu);
            this.menu.otherActions.selectedText.unshift(menuOptions.searchByGoogle);
        }
        this.friends=this.$store.getters.getManifest['friends']||[]
    },
    methods:{
        onContextMenuHandler(e){
            // console.log(e);
            this.showMenu=true
            this.menuHidden=false;
            this.menu.title=null
            this.menu.kaomoji=null
            // this.$set(this.pointerPos,'x',e.pageX)
            this.pointerPos={x:e.pageX,y:e.pageY};
            // console.log(this.pointerPos)
            this.menuGetter(e.target)
            this.touch=(e.sourceCapabilities&&e.sourceCapabilities.firesTouchEvents)
            // console.log(this.touch, this.showMenu||!this.menuHidden)
        },
        menuGetter(element){
            this.menu.data=window.getSelection().toString();
            if(!!this.menu.data) {
                this.menu.type='selectedText'
                return;
            }
            switch (element.nodeName) {
                case 'IMG':
                    this.menu.data=element.currentSrc||element.src
                    this.menu.type='image'
                    break;
                case 'BUTTON':
                    this.menu.data=element
                    this.menu.type='button'
                    break;
                case 'A':
                    // console.log(element.getAttribute('disabled')||element.getAttribute('aria-disabled'))
                    if(element.href&&!(element.getAttribute('disabled')||element.getAttribute('aria-disabled'))){
                        this.menu.data={url:element.href,target:element.target}
                        this.menu.type='link'
                    }else if(element.parentElement){
                        this.menuGetter(element.parentElement)
                    }else{
                        this.menu.data=null
                        this.menu.type='default';
                    }
                    break;
            
                default:
                    if(element.parentElement){
                        this.menuGetter(element.parentElement)
                    }else{
                        this.menu.data=null
                        this.menu.type='default';
                    }
                    break;
            }
            if(element.getAttribute('title')) this.menu.title=element.getAttribute('title');
            else if(element.getAttribute('data-title')) this.menu.title=element.getAttribute('data-title');
            if(element.getAttribute('kaomoji')) this.menu.kaomoji=element.getAttribute('kaomoji');
            else if(element.getAttribute('data-kaomoji')) this.menu.kaomoji=element.getAttribute('data-kaomoji');
        },
        download(url){
            var a = document.createElement('a');
            a.setAttribute('href',url);
            a.setAttribute('target','_blank');
            a.setAttribute('download','qrcode_'+location.host);
            a.click();
        },
    },
    watch:{
        qrcodeUrl(){
            QRCode.toDataURL(vm.qrcodeUrl, { errorCorrectionLevel: 'H' }, function (err, url) {
                vm.qrcodeBase64=url;
            })
        }
    }
};
</script>

<style lang="scss" scoped>
.liella{
    position: absolute;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    display: flex;
    flex-direction: column;
}
.liella-container{
    max-width: 1170px;
    align-items: stretch
}
.pointerPos{
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0px;
    border: none;
    outline: none;
    cursor: auto;
    opacity: 0;
    pointer-events: none;
}
.pointerMenu{
    user-select: none;
    max-width: none;
}
</style>
