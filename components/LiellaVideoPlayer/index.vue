<template>
    <div class="liella-video-player" @resize="resize" @mousemove="mousemove" @touchstart="mousemove" @mouseleave="showController!=false">
        <div ref="element" :class="{'liella-video':true,'fullscreen-in-page':fullscreenInPage}" autofocus="autofocus"  tabindex="-1" @click="playerClick" @dblclick="playerDbClick" @mouseleave="hideOverlayer(!true)" @mousewheel="mousewheel" @keydown.stop="keydown" @keyup.stop="keyup">
            <!-- <div ref="render-element" class="liella-video-player-render-element"> -->
                <canvas ref="canvas" class="liella-canvas" :width="width" :height="height"></canvas>
                <liella-video-player-danmaku ref="danmaku" class="liella-danmaku-player" v-if="showDanmaku" :style="{'font-size':(playerWidth<520?14:playerWidth<768?18:20)*danmakuSettings.fontSize+'px',opacity:danmakuSettings.opacity,height:(danmakuSettings.area)+'%'}" :danmus="danmakuList" :speeds="(danmakuSettings.autoSpeed?speed:100)*danmakuSettings.speed" useSlot :top="4">
                    <div></div>
                    <template v-slot:dm="{ index, danmu }">
                        <div :style="{'color':danmu.color,'display':danmu.blocked?'none':'inline-block'}" :class="'danmaku-stroke-'+danmakuSettings.stroke" @contextmenu.prevent.stop="showDanmakuContextMenu(danmu)">{{ danmu.text }}</div>
                    </template>
                </liella-video-player-danmaku>
            <!-- </div> -->
            <div class="liella-video-overlayer text" v-if="overlayText" :style="{'font-size':(playerWidth<520?12:playerWidth<768?14:20)+'px'}">
                <div class="liella-video-title">{{overlayText}}</div>
            </div>
            <div class="liella-video-overlayer text" :style="{'font-size':(playerWidth<520?12:playerWidth<768?14:20)+'px'}" style="background-color: rgba(255, 255, 255, 0.5);" v-if="loading">
                <!-- <div>
                    <div class="liella-video-overlayer-content"> -->
                        <lottie-player src="/player/loading.json"  background="transparent"  speed="1"  style="max-width: 100%; max-height: 90%;"  loop autoplay></lottie-player>
                    <!-- </div>
                </div> -->
                <div style="position: absolute;top: 66%;color: #000000;font-size: 1em;">加载中……</div>
            </div>
            <div class="liella-video-overlayer" v-if="overlayer" :style="{'font-size':(playerWidth<520?12:playerWidth<768?14:20)+'px'}" @click.stop="overlayer=null" @keydown.space.enter.stop @keyup.space.enter.stop>
                <div v-if="overlayer=='player-settings'" @mousewheel.stop>
                    <div class="liella-video-title">播放器设置</div>
                    <div class="liella-video-overlayer-content liella-video-overlayer-content-grid">
                            <div>
                                <liella-video-player-selector :list="{true:'自动切集',false:'单集播放'}" :selected="autoNext" @selected="(x)=>autoNext=x"/>
                            </div>
                            <div>
                                <liella-video-player-selector :list="{true:'洗脑循环',false:'不洗（'}" :selected="loop" @selected="(x)=>loop=x"/>
                            </div>
                            <div>
                                <liella-video-player-selector :list="{false:'正常画面',true:'镜像画面'}" :selected="mirror" @selected="(x)=>mirror=x"/>
                            </div>
                            <div>
                                <liella-video-player-selector :list="{true:'显示高能',false:'享受惊喜'}" :selected="precaution" @selected="(x)=>precaution=x"/>
                            </div>
                    </div>
                </div>
                <div v-else-if="overlayer=='speed'">
                    <div class="liella-video-title">播放速度</div>
                    <div class="liella-video-overlayer-content">
                        <liella-video-player-selector :list="speeds" :selected="speed" @selected="setSpeed"/>
                    </div>
                </div>
                <div v-else-if="overlayer=='volume'">
                    <div class="liella-video-title">声音&nbsp;({{muted?0:Math.floor(volume)}}%)</div>
                    <div class="liella-video-overlayer-content">
                        <liella-video-player-progress style="width:100%" height="1em" :max="100" :value="muted?0:volume" @seek="setVolume" progressd-color="#FFFFFF"/>
                        <liella-video-player-selector style="font-size: 0.75em;width:130%" :list="fastVolume" :selected="fastVolumeComputer(muted?0:volume)" @selected="setVolume" :average="true"/>
                        <!-- <liella-video-player-selector :list="{100:'ヒトリダケナンテエラベナイヨー！.jpg'}" :selected="volume*100" @selected="setVolume"/> -->
                    </div>
                </div>
                <div v-else-if="overlayer=='show-danmaku'" @mousewheel.stop>
                    <div class="liella-video-title">弹幕：{{selectedDanmaku.text}}</div>
                    <div class="liella-video-overlayer-content liella-video-overlayer-content-grid">
                        <div>
                            <h3>位置</h3>
                            <p>{{parseTime(selectedDanmaku.time)}}</p>
                            <liella-video-player-progress style="width:100%" height="1em" :max="duration" :value="selectedDanmaku.time" progressd-color="#FFFFFF"/>
                        </div>
                        <div>
                            <h3>颜色</h3>
                            <p>{{selectedDanmaku.color}}</p>
                            <div :style="{'background-color':selectedDanmaku.color,height:'1em',width:'100%'}"></div>
                        </div>
                        <div>
                            <h3>发送时间</h3>
                            <p>{{selectedDanmaku.datetime}}</p>
                        </div>
                        <div>
                            <h3>操作</h3>
                            <liella-video-player-selector :list="danmakuOptionLabels" @selected="danmakuOptionSelected"/>
                        </div>
                        
                        
                    </div>
                </div>
                <div v-else-if="overlayer=='danmaku'" @mousewheel.stop>
                    <div class="liella-video-title">发送弹幕</div>
                    <div class="liella-video-overlayer-content liella-video-overlayer-content-grid" @click.stop @keydown.stop @keyup.stop @keypress.stop>
                        <div style="width:100%">
                            <div style="display:flex">
                                <input style="flex:1" autofocus type="text" placeholder="在此输入弹幕" :style="{color:danmaku.color}" v-model="danmaku.text" @keypress.enter="_sendDanmaku"/>
                                <input style="width:auto;" :style="{'background-color':progressdColor}" autofocus type="button" value="发送" @click.stop="_sendDanmaku" @keydown.stop @keyup.stop/>
                            </div>
                            
                        </div>
                        <div>
                            <h3>位置</h3>
                            <liella-video-player-selector :list="{'right':'滚动','top':'顶部','bottom':'底部'}" :selected="danmaku.position" @selected="(position)=>{danmaku.position=position}"/>
                            <h3>颜色</h3>
                            <liella-video-player-color-picker :colors="danmakuColors" :selected="danmaku.color" @selected="(color)=>{danmaku.color=color}" />
                        </div>
                        <div>
                            <div v-html="danmakuRule" style="font-size: 0.75em;"></div>
                        </div>
                    </div>
                </div>
                <div v-else-if="overlayer=='danmaku-settings'" @mousewheel.stop>
                    <div class="liella-video-title">弹幕设置</div>
                    <div class="liella-video-overlayer-content liella-video-overlayer-content-grid">
                        <div>
                            <h3>透明度</h3>
                            <p>{{Math.floor(danmakuSettings.opacity*100)}}%</p>
                            <liella-video-player-progress style="width:100%" height="1em" :max="1" :value="danmakuSettings.opacity" @seek="(opacity)=>{setDanmakuSetting('opacity',opacity)}" progressd-color="#FFFFFF"/>
                        </div>
                        <div>
                            <h3>字号</h3>
                            <p>{{Math.floor(danmakuSettings.fontSize*100)}}%</p>
                            <liella-video-player-progress style="width:100%" height="1em" :min="0.5" :max="2" :value="danmakuSettings.fontSize" @seek="(fontSize)=>{setDanmakuSetting('fontSize',fontSize)}" progressd-color="#FFFFFF"/>
                        </div>
                        <div>
                            <h3>速度</h3>
                            <p>{{Math.floor(danmakuSettings.speed*100)}}%</p>
                            <liella-video-player-progress style="width:100%" height="1em" :min="0.5" :max="2" :value="danmakuSettings.speed" @seek="(speed)=>{setDanmakuSetting('speed',speed);resize()}" progressd-color="#FFFFFF"/>
                        </div>
                        <div>
                            <h3>与视频速度同步</h3>
                            <liella-video-player-selector :list="{true:'同步',false:'不同步'}" :selected="danmakuSettings.autoSpeed" @selected="(autoSpeed)=>setDanmakuSetting('autoSpeed',autoSpeed)"/>
                        </div>
                        <!-- <div style="width:100%">
                            <h3>显示区域</h3>
                            <liella-video-player-selector :list="{100:'全屏显示',75:'防挡字幕',50:'半屏显示',25:'四分之一屏'}" :selected="danmakuSettings.area" @selected="(area)=>{danmakuSettings.area=area;$refs['danmaku'].reset()}"/>
                        </div> -->
                        <div>
                            <h3>描边类型</h3>
                            <liella-video-player-selector :list="{0:'重墨',1:'描边',2:'投影'}" :selected="danmakuSettings.stroke" @selected="(stroke)=>setDanmakuSetting('stroke',stroke)"/>
                        </div>
                        <div>
                            <h3>弹幕屏蔽</h3>
                            <liella-video-player-selector :list="{0:'设置关键词'}" @selected="overlayer='black-keywords'"/>
                        </div>
                    </div>
                </div>
                <div v-else-if="overlayer=='black-keywords'" @mousewheel.stop>
                    <div class="liella-video-title">弹幕屏蔽词</div>
                    <div class="liella-video-overlayer-content" @click.stop>
                        <div>
                            <div style="display:flex">
                                <input style="flex:1" autofocus type="text" placeholder="在此输入屏蔽词" :style="{color:danmaku.color}" v-model="blackKeyword" @keypress.enter="setBlackKeyword(blackKeyword)"/>
                                <input style="width:auto;" :style="{'background-color':progressdColor}" autofocus type="button" value="添加" @click.stop="setBlackKeyword(blackKeyword)" @keydown.stop @keyup.stop/>
                            </div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;flex-direction:row;justify-content:flex-start;">
                            <div style="margin:0.5em;white-space:nowrap;word-break:keep-all;" v-for="(item,index) in reverseBlackKeywords" :key="index">
                                <span style="height:100%;display:inline-block;vertical-align:middle;">
                                    {{item}}
                                </span>
                                
                                <button class="icon" style="height:100%;vertical-align:middle;" @click="blackKeywords.splice(blackKeywords.length-index-1,1)">
                                    <b-icon icon="x" font-scale="1.2"></b-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="liella-video-controller" v-if="playerWidth>340" @mousewheel.stop @dblclick.stop @click.stop @keydown.space.enter.stop @keyup.space.enter.stop>
            <!-- <div class="liella-video-controller"> -->
                <div class="liella-video-top-bar" v-show="!overlayer&&showController">
                    <div class="liella-video-title">
                        {{title}}
                    </div>
<!--
                    <button class="icon" style="height:auto;" @click.stop="$emit('report')">
                        <b-icon icon="pencil-square" font-scale="1.2"></b-icon>
                        <span>&nbsp;反馈</span>
                    </button>
                 -->   
                </div>
                <div class="liella-video-controller-middle">
                    <div class="liella-video-message-box" @click.stop>
                        <div v-for="(item,index) in messages" :key="index">
                            <div class="liella-video-message">
                                <div class="liella-video-message-text">
                                    {{item.text}}
                                </div>
                                <button v-if="item.action" :class="{icon:item.action.icon}" @click="item.action.action?item.action.action(index)&&messages.splice(index,1):messages.splice(index,1)">
                                    <span v-if="item.action.text" :style="{color:progressdColor}">{{item.action.text}}</span>
                                    <b-icon v-if="item.action.icon" :icon="item.action.icon" :font-scale="item.action.scale"></b-icon>
                                </button>
                                <button class="icon" @click="messages.splice(index,1)">
                                    <b-icon icon="x" font-scale="1.5"></b-icon>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="liella-video-bottom-bar" :class="{small:!showController}" @click.stop v-show="overlayer!='danmaku'||!pointerPosition.touch">
                    <div class="liella-video-progress-bar">
                        <div class="liella-video-player-precaution-progress" v-if="precaution">
                            <canvas width="1000" height="100" ref="precaution"></canvas>
                        </div>
                        <liella-video-player-progress :height="showController?5:2" :max="duration" :value="currentTime" :buffered="buffered" @change="seekTo" :progressd-color="progressdColor"/>
                    </div>
                    <div class="liella-video-control-bar" @mouseover="hideOverlayer" @mouseleave="donotHideOverlayer=false" v-show="showController">
                        <button class="icon" @click="playing?pause():play()">
                            <b-icon :icon="(playing?'pause':'play')+'-fill'" font-scale="2"></b-icon>
                        </button>
                        <span>{{parseTime(currentTime)}}/{{parseTime(duration)}}</span>
                        <div style="flex:1;text-align:center;overflow:hidden;white-space:nowrap;word-break:keep-all;height:2em;">
                            <button v-if="fullscreen||fullscreenInPage" @click="showDanmaku=!showDanmaku">弹幕 {{showDanmaku?'开':'关'}}</button>
                            <button v-if="showDanmaku&&(fullscreen||fullscreenInPage)" @mouseover.stop="showOverlayer('danmaku-settings')" @focus="showOverlayer('danmaku-settings')">弹幕设置</button>
                            <button v-if="showDanmaku&&(fullscreen||fullscreenInPage)" style="padding:0.2em 0px;overflow:hidden;border-radius:3px;" @mouseover.stop @click="showOverlayer('danmaku')" @focus="showOverlayer('danmaku')">
                                <div style="height:1.8em;width:14em;background-color:#FFFFFF;"></div>
                                <div style="height:1.8em;padding:0em 1em;line-height:1.8em;" :style="{'background-color':progressdColor}">发送</div>
                            </button>
                        </div>
                        <button class="icon" @mouseover.stop="showOverlayer('speed')" @focus="showOverlayer('speed')">
                            <b-icon icon="stopwatch" font-scale="1.2"></b-icon>
                        </button>
                        <button class="icon" @mouseover.stop="showOverlayer('volume')" @focus="showOverlayer('volume')">
                            <b-icon icon="volume-up" font-scale="1.5"></b-icon>
                        </button>
                        <button class="icon" @mouseover.stop="showOverlayer('player-settings')" @focus="showOverlayer('player-settings')">
                            <b-icon icon="gear" font-scale="1.2"></b-icon>
                        </button>
                        <button class="icon" @mouseenter="overlayText='画中画'" @mouseleave="overlayText=''" @focus="overlayText='画中画',overlayer=null" @blur="overlayText=''" v-if="pictureInPictureEnabled" @click="pictureInPicture=!pictureInPicture">
                            <b-icon icon="app-indicator" font-scale="1.25" :animation="pictureInPicture?'fade':''"></b-icon>
                        </button>
                        <button class="icon" @mouseenter="overlayText='页面全屏'" @mouseleave="overlayText=''" @focus="overlayText='页面全屏'" @blur="overlayText=''" @click="fullscreenInPage=!fullscreenInPage">
                            <b-icon :icon="(fullscreenInPage&&!fullscreen)?'aspect-ratio-fill':'aspect-ratio'" font-scale="1.2"></b-icon>
                        </button>
                        <button class="icon" @mouseenter="overlayText='全屏'" @mouseleave="overlayText=''" @focus="overlayText='全屏'" @blur="overlayText=''" @click="fullscreen=!fullscreen">
                            <b-icon :icon="fullscreen?'fullscreen-exit':'fullscreen'" font-scale="1"></b-icon>
                        </button>
                    </div>
                </div>
                
            </div>
            <div v-else-if="messages.length>0" class="liella-video-mini-message-box" @click.stop @keydown.space.enter.stop @keyup.space.enter.stop>
                <div class="liella-video-mini-message-box-text">{{messages[messages.length-1].text}}</div>
                <div class="liella-video-mini-message-box-actions">
                    <button v-if="messages[messages.length-1].action" @click="messages[messages.length-1].action.action?messages[messages.length-1].action.action(messages.length-1)&&messages.splice(messages.length-1,1):messages.splice(messages.length-1,1)">
                        <span v-if="messages[messages.length-1].action.text" :style="{'font-size':'150%'}">{{messages[messages.length-1].action.text}}</span>
                        <b-icon v-if="messages[messages.length-1].action.icon" :icon="messages[messages.length-1].action.icon" :font-scale="messages[messages.length-1].action.scale"></b-icon>
                    </button>
                    <button @click="messages.splice(messages.length-1,1)">
                        <b-icon icon="x" font-scale="3"></b-icon>
                    </button>
                </div>
            </div>
            <div v-else class="liella-video-mini-controller" @click.stop @keydown.space.enter.stop @keyup.space.enter.stop>
                <button @click="playing?pause():play()">
                    <b-icon :icon="(playing?'pause':'play')+'-fill'" font-scale="4"></b-icon>
                </button>
                <button @click="fullscreen=!fullscreen">
                    <b-icon :icon="fullscreen?'fullscreen-exit':'fullscreen'" font-scale="2"></b-icon>
                </button>
            </div>
        </div>
        <div class="liella-danmaku" @click="donotHideOverlayer=true" v-if="!fullscreen&&!fullscreenInPage">
            <span>共{{danmakus.length}}条弹幕</span>
            <!-- <div> -->
                <b-form-checkbox class="ml-2" v-model="showDanmaku" switch>
                弹幕{{ showDanmaku ? '开启' : '关闭' }}
                </b-form-checkbox>
                <b-button v-if="showDanmaku" variant="link" @click="showOverlayer('danmaku-settings')">弹幕设置</b-button>
                <div v-if="showDanmaku" class="_sendDanmaku" @click="showOverlayer('danmaku')" tabindex="0">
                    <b-form-input style="pointer-events:none" placeholder="发个弹幕见证当下" disabled ></b-form-input>
                </div>
                
            <!-- </div> -->
        </div>
    </div>
</template>

<script>
var prefix = "liella-video-player-";
var prefixSettings = prefix+"settings-";
export default {
    name:"liella-video-player",
    props:{
        id:{
            type:String,
            required:true
        },
        width:{
            type:Number,
            default:1920
        },
        height:{
            type:Number,
            default:1080
        },
        src:{
            type:String,
            required:true
        },
        title:{
            type:String,
            default:''
        },
        poster:{
            type:String,
            default:null
        },
        danmakus:{
            type:Array,
            required:true
        },
        'progressd-color':{
            type:String,
            default:'#6c757d'
        },
        hideControllerDelay:{
            type:Number,
            default:2000
        },
        hasNext:{
            type:Boolean,
            default:false
        },
        'danmaku-rule':{
            type:String,
            default:''
        },
        'blocked-danmakus':{
            type:Array,
            default:[]
        }
    },
    data(){
        return {
            Math:Math,
            danmakuList:[],
            danmakusGroupedByTime:{},
            player:null,
            status:'',
            timeout:null,
            showController:true,
            duration:0,
            currentTime:0,
            targetTime:0,
            lastTime:0,
            seeking:false,
            canPlay:false,
            playing:false,
            fullscreen:false,
            fullscreenInPage:false,
            pictureInPicture:false,
            pictureInPictureEnabled:!!document.pictureInPictureEnabled,
            posterImage:null,
            showPoster:true,
            playerWidth:0,
            playerHeight:0,
            overlayer:null,
            overlayerHideTimeout:null,
            overlayerFontSize:14,
            overlayText:'',
            overlayTextTimeout:null,
            donotHideOverlayer:false,
            speeds:{
                50:'0.5x',
                75:'0.75x',
                100:'1x',
                125:'1.25x',
                150:'1.5x',
                200:'2x'
            },
            speed:process.client&&typeof window.localStorage.getItem(prefixSettings+'speed') == 'string'?eval(window.localStorage.getItem(prefixSettings+'speed')):100,
            buffered:null,
            volume:process.client&&typeof window.localStorage.getItem(prefixSettings+'volume') == 'string'?eval(window.localStorage.getItem(prefixSettings+'volume')):100,
            fastVolume:{
                0:'安静如鸡',
                25:'小声bb',
                50:'←中间→',
                75:'震耳欲聋',
                100:'ヒトリダケナンテエラベナイヨー！'
            },
            autoNext: process.client&&typeof window.localStorage.getItem(prefixSettings+'autoNext') == 'string'?eval(window.localStorage.getItem(prefixSettings+'autoNext')):true,
            loop: process.client&&typeof window.localStorage.getItem(prefixSettings+'loop') == 'string'?eval(window.localStorage.getItem(prefixSettings+'loop')):false,
            mirror: process.client&&typeof window.localStorage.getItem(prefixSettings+'mirror') == 'string'?eval(window.localStorage.getItem(prefixSettings+'mirror')):false,
            precaution: process.client&&typeof window.localStorage.getItem(prefixSettings+'precaution') == 'string'?eval(window.localStorage.getItem(prefixSettings+'precaution')):true,
            precautionDrawed: false,
            precautionData:[],
            precautionMax:0,
            muted:false,
            keyPressedTime:null,
            keyPressedTimeout:null,
            ctrlKeyUp:false,
            shiftKeyUp:false,
            pointerPosition:{
                x:0,
                y:0,
                movement:0,
                movementX:0,
                movementY:0,
                touch: false
            },
            touch: false,
            messages:[],
            playTimeout:null,
            selectedDanmaku:{},
            danmakuOptionLabels:{
                'copy':'复制',
                'block':'屏蔽',
                'complain':'举报',
            },
            danmakuColors:[
                '#FFFFFF',
                '#FE0302',
                '#FF7204',
                '#FFAA02',
                '#FFD302',
                '#FFFF00',
                '#A0EE00',
                '#00CD00',
                '#019899',
                '#4266BE',
                '#89D5FF',
                '#CC0273',
                '#222222',
                '#9B9B9B'
            ],
            danmaku:{
                text:'',
                color:'#FFFFFF',
                position:'right'
            },
            danmakuSettings:process.client&&typeof window.localStorage.getItem(prefixSettings+'danmaku') == 'string'?JSON.parse(window.localStorage.getItem(prefixSettings+'danmaku')):{
                opacity:1,
                fontSize:1,
                speed:1,
                autoSpeed:true,
                area:100,
                stroke:0
            },
            showDanmaku:true,
            loading:true,
            blackKeywords:process.client&&typeof window.localStorage.getItem(prefix+'black-keywords') == 'string'?JSON.parse(window.localStorage.getItem(prefixSettings+'black-keywords')):[],
            blackKeyword:'',
            danmakusMapping:{}
        }
    },
    computed:{
        reverseBlackKeywords(){
            return this.blackKeywords.slice(0).reverse()
        }
    },
    watch:{
        playing(){
            var functionName ;
            if(this.playing){
                functionName='play'
                this.timeout=setTimeout(() => {
                    this.showController=false;
                }, this.hideControllerDelay);
            }else{
                functionName='pause'
                if(this.timeout) clearTimeout(this.timeout)
            }
            this.player[functionName]();
            if(this.$refs['danmaku']) this.$refs['danmaku'][functionName]();
        },
        fullscreen(){
            if(this.fullscreen){
                var element = this.$refs['element'];
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
                setTimeout(() => {
                    this.overlayText='全屏已开启'
                }, 10);
            }else{
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                setTimeout(() => {
                    this.overlayText='全屏已关闭'
                }, 10);
            }
            this.playerWidth=this.$refs['element'].clientWidth;
            this.playerHeight=this.$refs['element'].clientHeight;
        },
        fullscreenInPage(){
            if(this.fullscreenInPage){
                setTimeout(() => {
                    this.overlayText='页面全屏已开启'
                }, 10);
            }else{
                setTimeout(() => {
                    this.overlayText='页面全屏已关闭'
                }, 10);
            }
            this.playerWidth=this.$refs['element'].clientWidth;
            this.playerHeight=this.$refs['element'].clientHeight;
        },
        pictureInPicture(){
            if(this.pictureInPicture&&!document.pictureInPictureElement){
                this.player.requestPictureInPicture()
                setTimeout(() => {
                    this.overlayText='画中画已开启'
                }, 10);
            }else if(document.pictureInPictureElement){
                document.exitPictureInPicture()
                setTimeout(() => {
                    this.overlayText='画中画已关闭'
                }, 10);
            }
        },
        overlayer(){
            if(this.overlayer===null&&document.activeElement.tagName.toLowerCase()=='body') this.$refs['element'].focus()
            if(this.overlayerHideTimeout){
                clearTimeout(this.overlayerHideTimeout)
            }
            this.donotHideOverlayer=false;
            this.resize()
        },
        overlayText(){
            if(this.overlayTextTimeout) clearTimeout(this.overlayTextTimeout);
            if(this.overlayText.length>0){
                this.overlayTextTimeout=setTimeout(() => {
                    this.overlayText='';
                }, 1000);
            }
        },
        playerHeight(){
            if(this.playerHeight<=this.playerWidth){
                this.overlayerFontSize=this.playerHeight*0.035;
                if(this.overlayerFontSize<10) this.overlayerFontSize=this.playerHeight*0.04;
            }
            
        },
        playerWidth(){
            if(this.playerHeight>this.playerWidth){
                this.overlayerFontSize=this.playerWidth*0.025;
            }
            
        },
        mirror(){
            var ctx = this.$refs['canvas'].getContext("2d");
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
            window.localStorage.setItem(prefixSettings+'mirror',this.mirror)
        },
        src(){
            this.player.src=this.src;
        },
        poster(){
            // console.log('poster')
            this.posterImage.src=this.poster;
        },
        precaution(){
            if(this.precaution){
                this.$nextTick(()=>{
                    this.drawPrecaution();
                })
                
            }else{
                this.precautionDrawed=false;
            }
            window.localStorage.setItem(prefixSettings+'precaution',this.precaution)
        },
        muted(){
            if(this.player.muted!=this.muted) this.player.muted=this.muted;
        },
        currentTime(){
            if(this.playing)
            window.localStorage.setItem(prefix+this.id,parseInt(this.currentTime*1000));
        },
        showDanmaku(){
            this.danmakuList=[]
        },
        danmakus(newArray,OldArray){
            if(newArray.length!=OldArray.length)
            this.initDanmakus()
        },
        loading(){
            if(!this.loading&&this.showPoster) this.$refs['canvas'].getContext("2d").drawImage(this.posterImage,0,0,this.width,this.height)
        },
        speed(){
            window.localStorage.setItem(prefixSettings+'speed',this.speed)
        },
        volume(){
            window.localStorage.setItem(prefixSettings+'volume',this.volume)
        },
        autoNext(){
            window.localStorage.setItem(prefixSettings+'autoNext',this.autoNext)
        },
        loop(){
            window.localStorage.setItem(prefixSettings+'loop',this.loop)
        },
        blackKeywords(){
            window.localStorage.setItem(prefixSettings+'black-keywords',JSON.stringify(this.blackKeywords));
        }
    },
    mounted(){
        // console.log(this.danmakus)
        var init = ()=>{
            this.initPlayer();
            this.renderNextFrame();
        }
        if(this.mirror){
            var ctx = this.$refs['canvas'].getContext("2d");
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
        }
        if(this.poster){
            var poster=document.createElement('img');
            poster.width=this.width;
            poster.height=this.height;

            poster.onload=init
            poster.src=this.poster;
            this.posterImage=poster;
        }else{
            init();
        }
        
        window.addEventListener("resize",this.windowResizeListener);
    },
    methods:{
        load(){
            this.player.src=this.src
            this.player.poster=this.poster
        },
        play(){
            if(this.canPlay){
                this.playing=true
            }
            
        },
        pause(){
            if(this.canPlay){
                this.playing=false
            }
        },
        seek(time){
            this.seeking=true;
            if(time<0) time = 0;
            if(time>this.duration) time = this.duration;
            this.targetTime=time;
        },
        seekEnd(){
            this.seekTo(this.targetTime);
            this.seeking=false;
        },
        seekTo(time){
            if(time<0) time = 0;
            if(time>this.duration) time = this.duration;
            if(this.playing==false) {
                this.player.play();
                setTimeout(() => {
                    this.player.pause();
                }, 1);
            }
            this.player.currentTime=time
            this.lastTime=time
            // this.$refs['danmaku'].reset();
            // this.danmakuList.splice(0,this.danmakuList.length)
        },
        setVolume(volume){
            this.muted=false;
            if(volume<0) volume = 0;
            else if(volume>100) volume = 100;
            this.player.volume=volume/100
        },
        mousemove(e){
            if(e.type.toLowerCase()=='touchstart') {
                this.touch=true;
                return;
            }
            this.pointerPosition.movementX=e.offsetX-this.pointerPosition.x;
            this.pointerPosition.movementY=e.offsetY-this.pointerPosition.y;
            this.pointerPosition.movement=Math.sqrt(Math.pow(this.pointerPosition.movementX,2)+Math.pow(this.pointerPosition.movementY,2));
            this.pointerPosition.x=e.offsetX;
            this.pointerPosition.y=e.offsetY;
            this.pointerPosition.touch=this.touch;
            this.touch=false;
            // console.log(JSON.stringify(this.pointerPosition))
            if(this.timeout) clearTimeout(this.timeout);
            this.showController=true;
            this.timeout=setTimeout(() => {
                this.showController=false;
            }, this.hideControllerDelay);
        },
        fastVolumeComputer(volume){
            var lastTargetVolume = 0;
            for (const key in this.fastVolume) {
                if (Object.hasOwnProperty.call(this.fastVolume, key)) {
                    var targetVolume = parseInt(key);
                    if(volume<targetVolume){
                        if((targetVolume-lastTargetVolume)/2+lastTargetVolume>volume) return lastTargetVolume;
                        else return targetVolume;
                    }
                    else if(volume==targetVolume) return targetVolume;
                    else lastTargetVolume=targetVolume;
                }
            }
            return volume;
        },
        resize(){
            this.playerWidth=this.$refs['element'].clientWidth;
            this.playerHeight=this.$refs['element'].clientHeight;
            if(this.$refs['danmaku']) this.$refs['danmaku'].resize();
        },
        windowResizeListener(){
            this.resize()
            this.fullscreen=!!(document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
        },
        renderNextFrame(){
            this.$refs['canvas']&&this.$refs['canvas'].getContext("2d").drawImage(this.showPoster?this.posterImage:this.player,0,0,this.width,this.height)
            requestAnimationFrame(this.renderNextFrame)
        },
        parseTime(seconds){
            return Math.floor(seconds/60) +':' + (Array(2).join(0)+Math.floor(seconds%60)).slice(-2)
        },
        setSpeed(speed){
            this.player.playbackRate=speed/100;
            this.overlayer=null;
        },
        keydown(e){
            var offsize = 5;
            if(e.ctrlKey&&e.shiftKey){
                offsize = 90;
            }else if(e.shiftKey){
                offsize = 30;
            }else if(e.ctrlKey){
                offsize = 10;
            }
            if(typeof this.keyPressedTime != 'number') this.ctrlKeyUp=this.shiftKeyUp=false;
            switch (e.keyCode) {
                case 37:
                    this.seeking=true;
                    var time = this.targetTime-offsize;
                    this.seek(time);
                    this.overlayText=this.parseTime(this.targetTime)+'（后退'+Math.round(this.currentTime-this.targetTime)+'秒）';
                    break;
                case 38:
                    var volume = parseInt(this.volume+offsize);
                    if(volume>100) volume = 100;
                    if(volume<0) volume = 0;
                    this.setVolume(volume);
                    this.overlayText='音量'+volume+'%'
                    break;
                case 39:
                    this.seeking=true;
                    var time = this.targetTime+offsize;
                    this.seek(time);
                    this.overlayText=this.parseTime(this.targetTime)+'（前进'+Math.round(this.targetTime-this.currentTime)+'秒）'
                    break;
                case 40:
                    var volume = parseInt(this.volume-offsize);
                    if(volume>100) volume = 100;
                    if(volume<0) volume = 0;
                    this.setVolume(volume);
                    this.overlayText='音量'+volume+'%'
                    break;
                case 70:
                    if(typeof this.keyPressedTime != 'number') {
                        this.fullscreen=!this.fullscreen;
                    }
                    break;  
                case 77:
                    if(typeof this.keyPressedTime != 'number') {
                        this.muted=!this.muted;
                    }
                    break;
            
                default:
                    if(e.ctrlKey||e.shiftKey) return;
                    break;
            }
            if(typeof this.keyPressedTime != 'number') this.keyPressedTime = 0;
            this.keyPressedTimeout=setTimeout(() => {
                this.keyPressedTime+=10;
            }, 10);
        },
        keyup(e){
            // console.log('keyup',e)
            switch (e.keyCode) {
                case 16:
                    this.shiftKeyUp=true;
                    return;
                case 17:
                    this.ctrlKeyUp=true;
                    return;
                case 32:
                    this[this.playing?'pause':'play']()
                    break;
                case 37:
                case 39:
                    this.seekEnd()
                    break;
                case 70:
                    if((this.keyPressedTime>=50 || e.ctrlKey)&&!this.ctrlKeyUp) this.fullscreen=!this.fullscreen;
                    break;  
                case 77:
                    if((this.keyPressedTime>=50 || e.ctrlKey)&&!this.ctrlKeyUp) this.muted=!this.muted;
                    break;
                default:
                    break;
            }
            this.ctrlKeyUp=this.shiftKeyUp=false;
            clearTimeout(this.keyPressedTimeout)
            this.keyPressedTime=null;
        },
        drawPrecaution(){
            // console.log('drawPrecaution')
            // console.log(this.precautionData)
            // console.log(this.$refs['precaution'])
            if(!this.$refs['precaution']) return this.precautionDrawed=false;
            this.$refs['precaution'].width=this.$refs['precaution'].width;
            this.$refs['precaution'].height=this.$refs['precaution'].height;
            var ctx = this.$refs['precaution'].getContext('2d');
            ctx.clearRect(0, 0, this.$refs['precaution'].width, this.$refs['precaution'].height);
            ctx.restore();
            ctx.translate(0, this.$refs['precaution'].height);
            ctx.scale(1, -1);
            ctx.beginPath()
            ctx.moveTo(0,0);
            var printData = []
            for (let index = 0; index < this.precautionData.length; index++) {
                var length = this.precautionData[index];
                if(length>0){
                    const time=index*100;
                    var x = (time/(this.duration*1000))*this.$refs['precaution'].width;
                    // const y = (length/this.precautionMax)*this.$refs['precaution'].height;
                    var y = (Math.log(length+1) * Math.LOG10E)/(Math.log(this.precautionMax+1) * Math.LOG10E)*(this.$refs['precaution'].height)+0;
                    if(x>this.$refs['precaution'].width) x = this.$refs['precaution'].width;
                    if(y>this.$refs['precaution'].height) y = this.$refs['precaution'].height;
                    ctx.lineTo(x, y);
                    printData.push(
                        [
                            [x,y],
                            [(time/(this.duration*1000)),(Math.log(length+1) * Math.LOG10E)/(Math.log(this.precautionMax+1) * Math.LOG10E)],
                            [time,length]
                        ]
                    )
                }
            }
            // console.log(printData)
            ctx.lineTo(this.$refs['precaution'].width, 0);
            ctx.closePath();
            ctx.clip();
            this.precautionDrawed=true;
            
            this.drawPrecautionProgress();
        },
        drawPrecautionProgress(){
            if(!this.$refs['precaution']) return this.precautionDrawed=false;
            if(!this.precautionDrawed) return this.drawPrecaution();
            var ctx = this.$refs['precaution'].getContext('2d');
            ctx.clearRect(0,0,this.$refs['precaution'].width,this.$refs['precaution'].height);
            ctx.fillStyle="#FFFFFF";
            ctx.fillRect(0,0,this.$refs['precaution'].width,this.$refs['precaution'].height);
            ctx.fillStyle=this.progressdColor;
            ctx.fillRect(0,0,this.$refs['precaution'].width*(this.currentTime/this.duration),this.$refs['precaution'].height);
        },
        hideOverlayer(ignoreMovement){
            if(this.donotHideOverlayer) return;
            if(!!ignoreMovement||this.pointerPosition.movement<3||this.pointerPosition.touch){
                this.overlayer=null
            }
        },
        showOverlayer(name,ignoreMovement){
            if(!!ignoreMovement||this.pointerPosition.movement<3||this.pointerPosition.touch){
                this.overlayer=name
            }
        },
        playerClick(){
            // console.log(this.pointerPosition.touch)
            if(this.pointerPosition.touch) return;
            clearTimeout(this.playTimeout);
            this.playTimeout=setTimeout(() => {
                (this.playing?this.pause:this.play)()
            }, 300);
        },
        playerDbClick(){
            // console.log('dblclick')
            clearTimeout(this.playTimeout);
            if(!this.pointerPosition.touch){
                this.fullscreen=!this.fullscreen
            }else{
                (this.playing?this.pause:this.play)()
            }
            
        },
        showDanmakuContextMenu(danmaku){
            this.overlayer='show-danmaku';
            this.selectedDanmaku=danmaku;
            this.pause()
        },
        mousewheel(e){
            if(e.wheelDeltaY>0){
                this.setVolume(this.volume+1)
            }else if(e.wheelDeltaY<0){
                this.setVolume(this.volume-1)
            }
            if(this.overlayer!='volume')this.overlayText='音量'+parseInt(this.volume)+'%'
        },
        danmakuOptionSelected(optionName){
            switch (optionName) {
                case 'copy':
                    this.$copyText(this.selectedDanmaku.text)
                        .then(()=>{
                            this.messages.push(
                                {
                                    text:'复制成功！'
                                }
                            )
                        })
                        .catch(()=>{
                            this.messages.push(
                                {
                                    text:'复制失败！'
                                }
                            )
                        })
                    break;
                case 'block':
                    this.$emit('blockdanmaku',this.selectedDanmaku);
                    // this.blockDanmaku(this.selectedDanmaku.cid);
                    break;
                case 'complain':
                    this.$emit('complaindanmaku',this.selectedDanmaku)
                    
                    break;
            
                default:
                    break;
            }
            this.overlayer=null;
        },
        _sendDanmaku(){
            var danmaku = {
                time:this.currentTime,
                datetime:new Date()
            };
            danmaku.text=this.danmaku.text;
            danmaku.position=this.danmaku.position;
            danmaku.color=this.danmaku.color;
            this.$emit('senddanmaku',danmaku);
        },
        sendDanmaku(danmaku){
            this.danmakuList.push(danmaku)
        },
        initDanmakus(){
            // console.log('initDanmakus')
            this.danmakus.sort((a,b)=>{
                return a.time-b.time;
            })
            this.danmakusGroupedByTime={};
            this.precautionData=[];
            for (let index = 0; index <= parseInt(this.duration*10); index++) {
                this.precautionData[index]=0
            }
            for (const index in this.danmakus) {
                if (Object.hasOwnProperty.call(this.danmakus, index)) {
                    const danmaku = JSON.parse(JSON.stringify(this.danmakus[index]));
                    if(danmaku.time<0) continue;
                    if(danmaku.time>this.duration) danmaku.time=this.duration;
                    const time = parseInt(danmaku.time*10)*100;
                    // console.log(time,danmaku.time,this.duration)
                    if(typeof this.danmakusGroupedByTime[time] == 'undefined') this.danmakusGroupedByTime[time] = [];
                    // if(typeof this.precautionData[time] == 'undefined') this.precautionData[time] = 0;
                    danmaku.blocked=false;
                    this.danmakusGroupedByTime[time].push(danmaku);
                    this.danmakusMapping[danmaku.cid]=danmaku;
                    const length = this.precautionData[time/100]++;
                    if(this.precautionMax<length) this.precautionMax = length;
                }
            }
            if(this.precaution) this.drawPrecaution()
        },
        initPlayer(){
            var loadingTimeout = null;
            this.playerWidth=this.$refs['element'].clientWidth;
            this.playerHeight=this.$refs['element'].clientHeight;
            var player=this.player||document.createElement('video');
            player.preload="auto";
            player.playsInline=true;
            
            player.onloadedmetadata=(e)=>{
                console.log(e)
                // console.log({player})
                // this.duration=player.duration
                var lastPlayerTime = window.localStorage.getItem(prefix+this.id);
                if(lastPlayerTime) this.sendMessage(
                    {
                        text:'上次播放到：'+this.parseTime(parseInt(lastPlayerTime/1000)),
                        action:{
                            text:'跳转播放',
                            action:()=>{
                                this.seekTo(lastPlayerTime/1000)
                                if(!this.playing) this.play();
                                return true;
                            }
                        }
                    }
                )
                this.hideLoading()
                this.canPlay=true;
                this.initDanmakus();
            }
            player.ontimeupdate=()=>{
                this.currentTime=player.currentTime;
                if(!this.seeking) this.targetTime=player.currentTime;
                if(this.precaution) this.drawPrecautionProgress();
                var currentTime = parseInt(this.currentTime*10)*100
                var lastTime = parseInt(this.lastTime*10)*100
                // console.log((parseInt(this.currentTime*10)*100),lastTime)
                for (let time = lastTime; time < currentTime; time+=100) {
                    var danmakus = [];
                    var reg = new RegExp('[('+this.blackKeywords.join(')|(')+')]')
                    for (const index in this.danmakusGroupedByTime[time]) {
                        if (Object.hasOwnProperty.call(this.danmakusGroupedByTime[time], index)) {
                            const danmaku = this.danmakusGroupedByTime[time][index];
                            if(!reg.test(danmaku.text)&&this.blockedDanmakus.indexOf(danmaku.cid)<0) danmakus.push(danmaku);
                        }
                    }
                    if(this.$refs['danmaku']) this.danmakuList.push.apply(this.danmakuList,danmakus);
                    // console.log(time)
                }
                if(loadingTimeout!=null) {
                    clearTimeout(loadingTimeout);
                    loadingTimeout=null;
                    this.hideLoading();
                }
                this.lastTime=this.currentTime
            }
            player.ondurationchange=()=>{
                this.duration=player.duration
                // console.log(this.danmakus)
            }
            player.oncanplay=()=>{
                this.canPlay=true
                if(loadingTimeout!=null) {
                    clearTimeout(loadingTimeout);
                    loadingTimeout=null;
                }
                this.hideLoading();
            }
            player.onplay=()=>{
                this.playing=true
                this.showPoster=false
                if(loadingTimeout!=null) {
                    clearTimeout(loadingTimeout);
                    loadingTimeout=null;
                }
                    this.hideLoading();
                // if(this.$refs['danmaku']) this.$refs['danmaku'].play();
            }
            player.onpause=()=>{
                this.playing=false;
                if(this.$refs['danmaku']) this.$refs['danmaku'].pause();
            }
            player.onleavepictureinpicture=()=>{
                this.pictureInPicture=false
            }
            player.onenterpictureinpicture=()=>{
                this.pictureInPicture=true
            }
            player.onratechange=()=>{
                this.speed=player.playbackRate*100
                if(this.danmakuSettings.autoSpeed) this.resize();
            }
            player.onprogress=()=>{
                this.buffered=player.buffered
                // if(this.playing){
                //    loadingTimeout = setTimeout(this.showLoading, 500);
                // }
            }
            player.onvolumechange=()=>{
                if(player.volume==0) this.muted=true;
                else this.volume=player.volume*100
            }
            player.onended = () => {
                if(this.loop){
                    if(this.autoNext) this.$emit('require-next');
                    else this.player.play();
                }else{
                    if(this.autoNext&&this.hasNext) this.$emit('require-next');
                }
            };
            player.onwaiting = () => {
            //     console.log('waiting')
                this.showLoading()
            }
            player.oncanplaythrough = () => {
                this.hideLoading()
            }
            player.onerror = () => {
                var text = "发生未知的错误";
                switch (player.error.code) {
                    case 1:
                        text="取回过程被中止"
                        break;
                    case 2:
                        text="下载时发生错误"
                        break;
                    case 3:
                        text="解码时发生错误"
                        break;
                    case 4:
                        text="不支持的媒体源"
                        break;
                }
                this.sendMessage(
                    {
                        text:text
                    }
                )
            }
            player.src=this.src
            player.poster=this.poster
            // console.log(this.volume)
            player.volume=this.volume/100;
            this.muted=player.muted;
            this.player=player;
        },
        setDanmakuSetting(name,value){
            this.danmakuSettings[name]=value;
            window.localStorage.setItem(prefixSettings+'danmaku',JSON.stringify(this.danmakuSettings))
        },
        setBlackKeyword(keyword){
            this.blackKeywords.push(keyword);
            this.blackKeyword=''
        },
        sendMessage(options){
            this.messages.push(options)
        },
        blockDanmaku(cid){
            this.danmakusMapping[cid]&&(this.danmakusMapping[cid].blocked=true)
        },
        clearEditedDanmaku(){
            this.danmaku={
                text:'',
                color:'#FFFFFF',
                position:'right'
            };
        },
        showLoading(){
            this.loading=true;
            if(this.$refs['danmaku']) this.$refs['danmaku'].pause();
        },
        hideLoading(){
            console.log("hide-loading",this.playing)
            this.loading=false;
            if(this.playing&&this.$refs['danmaku']) this.$refs['danmaku'].play();
        }
    },
    destroyed(){
        this.player.pause();
        this.player.src='';
        this.player=null;
        window.removeEventListener("resize",this.windowResizeListener)
    }
}
</script>

<style lang="scss" scoped>
.liella-video{
    position: relative;
    overflow: hidden;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000000;
    color: #FFFFFF;
    user-select: none;

    button{
        background: transparent;
        border: none;
        height: 2em;
        min-width: 2em;
        color: inherit;
        line-height: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1em;
        opacity: 0.75;
        transition: all 0.2s ease-in-out;
        pointer-events: all;

        &:hover,
        &:focus{
            opacity: 1;
        }

        &.icon:hover,
        &.icon:focus{
            transform: scale(1.5);
        }
    }

    &.fullscreen-in-page{
        position: fixed;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        width: 100%;
        height: 100%;
    }

    .liella-canvas{
        position: relative;
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        vertical-align: middle;
    }
    .liella-danmaku-player{
        position: absolute;
        width: 100%;
        height: 100%;
        line-height: 1.5;

        // .top{
        //     // position: absolute;
        //     left: 0px;
        //     right: 0px;
        //     top: 0px;
        //     height: 1em;
        // }

        .danmaku-stroke-0{
            text-shadow: rgb(0,0,0) 1px 0px 1px, rgb(0,0,0) 0px 1px 1px, rgb(0,0,0) 0px -1px 1px, rgb(0,0,0) -1px 0px 1px;
        }

        .danmaku-stroke-1{
            text-shadow: rgb(0,0,0) 0px 0px 1px, rgb(0,0,0) 0px 0px 1px, rgb(0,0,0) 0px 0px 1px;
        }

        .danmaku-stroke-2{
            text-shadow: rgb(0,0,0) 1px 1px 2px, rgb(0,0,0) 0px 0px 1px;
        }
    }

    .liella-video-overlayer{
        background-color: rgba($color: #000000, $alpha: 0.5);
        line-height: 1.2;
        z-index: 3;
        overflow-y: auto;
        overflow-x: hidden;
        // font-size: 1em;
        // justify-content: center;
        // align-items: center;

        // @media (min-width: 992px){
        //     font-size: 2em;
        // }

        &.text{
            background-color: rgba($color: #000000, $alpha: 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
            padding-bottom: 1em;
            text-shadow: 0px 0px 1em rgba($color: #000000, $alpha: 0.25);
            letter-spacing:0.15em;
            // word-spacing: 0.5em;
        }

        &:not(.text)>*{
            width: 100%;
            height: 100%;
            padding: 2em 2em;
            display: flex;
            flex-direction: column;
        }
        .liella-video-title{
            font-size: 1.5em;
        }
        .liella-video-overlayer-content{
            margin: 2em auto;
            width: 80%;
            // max-width: 768px;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            align-content: center;
            padding-bottom: 3em;

            >*{
                width: 100%;
            }

            &.liella-video-overlayer-content-grid{
                flex-direction: row;
                flex-wrap: wrap;
                align-items: stretch;

                >*{
                    width:50%;
                    padding:1em;
                }
            }

            input{
                width: 100%;
                background-color: rgba($color: #FFFFFF, $alpha: 0.35);
                border: none;
                outline: none;
                color: #FFFFFF;
                padding: 0.5em 0.75em;
                transition: all 0.2s ease-in-out;

                &:hover,
                &:focus{
                    background-color: rgba($color: #FFFFFF, $alpha: 0.5);
                    opacity: 1;
                }
            }
        }
    }

    .liella-video-controller{
        $background-color: rgba($color: #000000, $alpha: 0.25);
        display: flex;
        flex-direction: column;
        user-select: none;
        pointer-events: none;
        z-index: 4;

        .liella-video-top-bar{
            background-image: linear-gradient(to bottom, rgba($color: $background-color, $alpha: 0.5), rgba($color: $background-color, $alpha: 0));
            line-height: 2;
            pointer-events: all;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            pointer-events: none;
            >*{
                padding: 1em 1.5em;
            }
            .liella-video-title{
                font-size: 1.25em;
                flex: 1;
            }
        }

        .liella-video-controller-middle{
            flex: 1;
            position: relative;

            .liella-video-message-box{
                position: absolute;
                left: 1em;
                right: 1em;
                bottom: 0px;

                .liella-video-message{
                    background-color: rgba($color: #000000, $alpha: 0.25);
                    padding: 0.6em 0.75em;
                    pointer-events: all;
                    transition: background-color 0.2s ease-in-out;
                    line-height: 1.5;
                    border-radius: 3px;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    align-items: center;
                    display: inline-flex;
                    margin-top: 1em;

                    &:hover{
                        background-color: rgba($color: #000000, $alpha: 0.5);
                    }

                    .liella-video-message-text{
                        padding: 0em 0.75em;
                        flex: 1;
                    }
                }
            }
        }
        
        .liella-video-bottom-bar{
            &:not(.small) > *{
                // >*{
                    padding: 0.5em 0.75em;
                // }
            }
            
            >*:nth-of-type(n+2){
                padding-top: 0px;
            }
            .liella-video-control-bar{
                background-image: linear-gradient(to top, rgba($color: $background-color, $alpha: 0.75), $background-color);
                display: flex;
                align-items: center;
                pointer-events: all;
                white-space: nowrap;
                word-break: keep-all;

                >*{
                    // vertical-align: middle;
                    padding: 0em 0.75em;
                }

                *{
                    vertical-align: middle;
                }

                // button{
                //     background: transparent;
                //     border: none;
                //     height: 2em;
                //     min-width: 2em;
                //     color: inherit;
                //     line-height: 0;
                //     display: inline-flex;
                //     align-items: center;
                //     justify-content: center;
                //     font-size: 1em;
                //     opacity: 0.75;
                //     transition: all 0.2s ease-in-out;

                //     &:hover,
                //     &:focus{
                //         opacity: 1;
                //     }

                //     &.icon:hover,
                //     &.icon:focus{
                //         transform: scale(1.5);
                //     }
                // }
                span{
                    font-size: 0.85em;
                }
            }

            &.small{
                .liella-video-progress-bar{
                    background-image: none!important;
                }
            }
            .liella-video-progress-bar{
                background-image: linear-gradient(to top, $background-color, rgba($color: $background-color, $alpha: 0));

                .liella-video-player-precaution-progress{
                    width: 100%;
                    opacity: 0.25;
                    canvas{
                        width: 100%;
                        height: 25px;
                    }

                    // &:hover,
                    // &:focus,
                    // &.seeking{
                    //     opacity: 0.75;
                    // }
                }
                .liella-video-player-progress{
                    pointer-events: all;
                }
            }
            
        }
    }

    .liella-video-mini-message-box,
    .liella-video-mini-controller{
        background-color: rgba($color: #000000, $alpha: 0.5);
        color: #FFFFFF;

        button{
            background: transparent;
            border: none;
            color: inherit;
            line-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

    }

    .liella-video-mini-message-box{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.5;

        >*{
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }

        .liella-video-mini-message-box-text{
            padding-top: 1em;
            font-size: 1.5em;
        }

        .liella-video-mini-message-box-actions{
            justify-content: space-evenly;
            flex-direction: row;
        }
    }

    .liella-video-mini-controller{
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        flex-direction: row;
        background-color: rgba($color: #000000, $alpha: 0.5);
        opacity: 0;
        color: #FFFFFF;
        transition: opacity 0.2s ease-in-out;

        &:hover{
            opacity: 1;
        }
    }

    >*{
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
    }

}
.liella-danmaku{
    padding: 0.5em 1.5em;
    height: 4em;
    font-size: 0.9em;
    color: #6c757d;
    line-height: 2;
    display: flex;
    align-items: center;
    user-select: none;

    ._sendDanmaku{
        flex:1;
        cursor: pointer;
        opacity: 0.75;
        transition: opacity 0.2s ease-in-out;

        &:hover,
        &:focus{
            opacity: 1;
        }
    }
}
</style>

<style lang="scss">
.liella-video-player{

    h1,h2,h3,h4,h5,h6{
        font-weight: 500;
        line-height: 1.2;
        margin: 0px 0px 0.5em;
    }

    h1{
        font-size: 2.5em;
    }
    h2{
        font-size: 2em;
    }
    h3{
        font-size: 1.75em;
    }
    h4{
        font-size: 1.5em;
    }
    h5{
        font-size: 1.25em;
    }
    h6{
        font-size: 1em;
    }

    p{
        line-height: 1.2;
    }
}
</style>
