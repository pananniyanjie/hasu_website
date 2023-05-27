<template>
  <div>
    <liella-banner :src="banner"></liella-banner>
    <b-container tag="main" class="liella-main offsize">
      <template v-for="(part,i) in data" >
        <liella-part 
          class="mb-3 mb-md-4" 
          :key="i"
        >
          <template v-for="(item,index) in part" >
            <liella-divider :key="index" v-if="item=='divider'" />
            <div :key="index" v-else-if="visibleHandler(item['hide-in'])">
              <h3 v-if="item.title">{{item.title}}</h3>
              <liella-divider v-if="item.title&&item.divider" />
              <b-row 
                :cols="item.cols&&(item.cols.xs||item.cols.default||item.cols)" 
                :cols-sm="item.cols&&(item.cols.sm||item.cols.xs||item.cols.default||item.cols)" 
                :cols-md="item.cols&&(item.cols.md||item.cols.sm||item.cols.xs||item.cols.default||item.cols)" 
                :cols-lg="item.cols&&(item.cols.lg||item.cols.md||item.cols.sm||item.cols.xs||item.cols.default||item.cols)" 
                :cols-xl="item.cols&&(item.cols.xl||item.cols.lg||item.cols.md||item.cols.sm||item.cols.xs||item.cols.default||item.cols)" 
                align-content="stretch"
              >
                <b-col 
                  v-for="(child,index1) in arrayMixer(item.prepend,item['use-data']?$store.getters.getManifest[item['use-data']]:item.children,item.append)" 
                  :key="index1" 
                  class="px-2 px-md-3 my-2"
                  :cols="child.cols&&(child.cols.xs||child.cols.default||child.cols)"
                  :sm="child.cols&&(child.cols.sm||child.cols.xs||child.cols.default||child.cols)"
                  :md="child.cols&&(child.cols.md||child.cols.sm||child.cols.xs||child.cols.default||child.cols)"
                  :lg="child.cols&&(child.cols.lg||child.cols.md||child.cols.sm||child.cols.xs||child.cols.default||child.cols)"
                  :xl="child.cols&&(child.cols.xl||child.cols.lg||child.cols.md||child.cols.sm||child.cols.xs||child.cols.default||child.cols)"
                >
                  <component 
                    :is="attributeGetter([child,item.children],'tag')||item['child-tag']" 
                    v-bind="objectMixer(child,item.children[0]?{}:item.children)"
                    :image="attributeGetter([child,item.children],'image')" 
                    :color="attributeGetter([child,item.children],'color')" 
                    :href="attributeGetter([child,item.children],'link')" 
                    :to="attributeGetter([child,item.children],'to')" 
                    :scale-inside="attributeGetter([child,item.children],'scale-inside')"
                    :overlay="attributeGetter([child,item.children],'overlay')"
                    :title="attributeGetter([child,item.children],'title')"
                    :introduction="attributeGetter([child,item.children],'introduction')"
                    :links="attributeGetter([child,item.children],'links')"
                    :kaomoji="attributeGetter([child,item.children],'kaomoji')"
                    :disabled="attributeGetter([child,item.children],'disabled')"
                    :variant="attributeGetter([child,item.children],'variant')"
                    :class="attributeGetter([child,item.children],'class')"
                    :size="attributeGetter([child,item.children],'size')"
                  />
                </b-col>
              </b-row>
            </div>
              
          </template>
        </liella-part>
      </template>
    </b-container>
  </div>
</template>

<script>
import { match } from 'path-to-regexp';
import createAxios from '../actions/createAxios'
export default {
  asyncData({ route , store , error }) {
    // console.log(arguments[0]);
    var manifest = store.getters.getManifest;
    for (const path in manifest.pages) {
      if (Object.hasOwnProperty.call(manifest.pages, path)) {
        const target = manifest.pages[path];
        const matcher = match(path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"));
        const matchResult = matcher(route.path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"));
        // console.log(route.path.replace(/\/index([^a-zA-Z0-9]|$)/g,"/"),matchResult)
        if(matchResult){
          // console.log(store.getters.getManifest.baseURL+toPath(matchResult.params))
          return createAxios(target,{
            params:matchResult.params,
            baseURL:(process.server&&store.getters.getManifest.baseURL.indexOf('http')!=0?process.env.baseURL:'')+store.getters.getManifest.baseURL
          }).then((result)=>{
            // route.params.page=result.data;
            // this.page=result.data
            return {
              title:result.data.title,
              heads:result.data.heads,
              data:result.data.data,
              banner:result.data.banner,
            };
          }).catch(e=>{
            console.error(e)
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
  head() {
    return this.heads||{title:this.title}
  },
  data(){
    return {
      data:[],
      banner:'/image/banner.jpg',
      title:'',
      windowSize:{
        width:0,
        height:0
      }
    }
  },
  computed:{
    visibleHandler(){
      return this._visibleHandler
    }
  },
  methods:{
    _visibleHandler(size){
      // if(size)console.log(size)
      var targetWidth=0;
      switch (size) {
        case 'sm':
          targetWidth=576
          break;

        case 'md':
          targetWidth=768
          break;

        case 'lg':
          targetWidth=992
          break;
          
        case 'xl':
          targetWidth=1200
          break;
      }
      return this.windowSize.width>=targetWidth
    },
    windowResizeHandler(e){
      this.windowSize={
        width:window.innerWidth,
        height:window.innerHeight
      }
    },
    arrayMixer(){
      var newArray = [];
      for (const index in arguments) {
        if (Object.hasOwnProperty.call(arguments, index)) {
          const array = arguments[index];
          if(typeof array == 'object')newArray.push.apply(newArray,array)
        }
      }
      return newArray
    },
    objectMixer(){
      var newObject = {}
      // console.log(arguments)
      for (const index in arguments) {
        if (Object.hasOwnProperty.call(arguments, index)) {
          const object = arguments[index];
          for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {
              const value = object[key];
              newObject[key]=value;
            }
          }
        }
      }
      // console.log(newObject)
      return newObject;
    },
    attributeGetter(from,attributeName){
      if(typeof from == 'object'){
        for (const key in from) {
          if (Object.hasOwnProperty.call(from, key)) {
            const value = from[key];
            if(!!value[attributeName]) return value[attributeName];
          }
        }
      }else{
        return from[attributeName];
      }
    }
  },
  mounted(){
    this.windowSize.width=window.innerWidth;
    this.windowSize.height=window.innerHeight;
    window.addEventListener('resize',this.windowResizeHandler);
  },
  destroyed(){
    window.removeEventListener('resize',this.windowResizeHandler);
  }
}
</script>
