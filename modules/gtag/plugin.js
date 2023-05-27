import gtag, { install as _install } from 'ga-gtag';
export default function ({ app: { router } }, inject){
    var installed = false;
    gtag.install = function install(){
        _install.apply(_install,arguments);
        installed=true;
    }
    inject('gtag',gtag)
    router.afterEach((to) => {
        if(installed){
            gtag('set', 'page_path', to.fullPath);
            gtag('event', 'page_view');
        }
    })
}