import axios from 'axios'
import { compile } from 'path-to-regexp';

function mergeObject(object1,object2){
    if(object1==null||typeof object1 == 'undefined') return object2;
    if(object2==null||typeof object2 == 'undefined') return object1;
    if(typeof object1 != 'object') return object1;
    var object = {};
    if(typeof object2 == 'object'){
        for (const key in object2) {
            if (Object.hasOwnProperty.call(object2, key)) {
                const value = object2[key];
                object[key]=value;
            }
        }
    }
    for (const key in object1) {
        if (Object.hasOwnProperty.call(object1, key)) {
            const value = object1[key];
            object[key]=(typeof object[key] == 'object' && typeof value == 'object')?mergeObject(object[key],value):value
        }
    }
    return object;
}

function createAxios(config1,config2){
    var config = {};
    if(typeof config1 == 'string'){
        config['url']=config1;
        config['method']='GET';
    }else if(typeof config1 == 'object'){
        for (const key in config1) {
            if (Object.hasOwnProperty.call(config1, key)) {
                const value = config1[key];
                config[key]=value;
            }
        }
    }else{
        throw new Error('Param config1 must be an object or string.')
    }
    if(typeof config2 == 'object'){
        config=mergeObject(config,config2)
    }
    if(config.url) config.url=compile(config.url, { encode: encodeURIComponent })(config.params||{});
    else throw new Error('URL is required.');

    // config.transformRequest=config.transformRequest||[];
    // config.transformRequest.push((data)=>{
    //     console.log(config)
    //     console.log(config.headers['Content-Type'].toLowerCase().indexOf('json'))
    //     if(config.headers&&config.headers['Content-Type']){
    //         if(config.headers['Content-Type'].toLowerCase().indexOf('json')>=0) return JSON.stringify(data);
    //     }
    //     return data;
    // })

    return axios(config);

}

export default createAxios;