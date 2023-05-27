function manifestSetter(axios,address,baseURL){
    // console.log(axios)
    axios.defaults.baseURL=baseURL;
    return axios.get(address,{
        baseURL:baseURL
    }).then((result)=>{
        // console.log(result);
        var manifest = result.data;
        if(manifest.baseURL) {
            // if(process.server&&manifest.baseURL.indexOf('http')!=0){
            //     manifest.baseURL=process.env.baseURL+manifest.baseURL;
            // }
            axios.defaults.baseURL=manifest.baseURL;
        }
        // console.log(manifest)
        if(manifest.manifest) return manifestSetter(axios,manifest.manifest,(process.server&&(manifest.baseURL||baseURL).indexOf('http')!=0?process.env.baseURL:'')+(manifest.baseURL||baseURL))
            .then((res)=>{
                for (const key in res) {
                    if (Object.hasOwnProperty.call(res, key)) {
                        const value = res[key];
                        manifest[key]=value;
                    }
                }
                // console.log(manifest)
                return manifest;
            })
        return manifest;
    })
}

function pageLoaded({ app, store, redirect, route, from }){
    var agreement = !(route.name=='user-agreement'||route.name=='rules-name-all')&&!app.$cookies.get('agreement-agreed');
    if(process.client)document.title=store.getters.getManifest.title||document.title
    if(agreement) {
        redirect( { name: 'user-agreement' });
        store.commit('setRedirectFrom',from);
    }
}

function manifestLoaded(result, { app, store }){
    store.commit('setManifest', result);
    if(result.baseURL) app.$axios.defaults.baseURL=result.baseURL;
    if(app.$clarity){
        if(typeof result.microsoft == 'object'){
            if(typeof result.microsoft.clarity == 'object') app.$clarity.start(result.microsoft.clarity);
            else if(typeof result.microsoft.clarity == 'string') app.$clarity.start({"projectId":result.microsoft.clarity,"upload":"https://www.clarity.ms/eus/collect","expire":365,"cookies":["_uetmsclkid","_uetvid"],"track":true,"lean":false,"content":true});
        }
        
    }
    if(app.$gtag){
        if(typeof result.google == 'object'){
            if(typeof result.google.analytics == 'object'){
                if(result.google.analytics['measurement-id']) {
                    var args = [result.google.analytics['measurement-id']]
                    if(typeof result.google.analytics['config'] == 'object') args.push(result.google.analytics['config'])
                    app.$gtag.install.apply(app.$gtag.install,args);
                }
            }
        }
    }
}

export default function ({ app, store, route, req }) {
    if(app.$axios){
        // console.log(req)
        if(process.client&&!window.document.oncontextmenu) window.document.oncontextmenu = function(){return false;}
        if(!store.getters.getManifest){
            // console.log('xxx')
            app.$axios.defaults.baseURL=process.env.baseURL;
            return manifestSetter(app.$axios,'/_manifest.json',process.server?process.env.baseURL:'').then((result)=>{
                manifestLoaded(result,arguments[0]);
                pageLoaded(arguments[0]);
            })
        }else{
            pageLoaded(arguments[0]);
        }
    }

}