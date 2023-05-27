export default function ({ app, store, }){
        // console.log(arguments)
    if(store.getters.getExit&&process.client){
        window.history.back();
    }
}