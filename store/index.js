export const state = () => ({
    manifest: null,
    redirectFrom: null,
    exit:false
})

export const mutations = {
    setManifest(state , manifest) {
        state.manifest=manifest
    },
    setRedirectFrom(state , redirectFrom) {
        state.redirectFrom=redirectFrom
    },
    setExit(state , exit) {
        state.exit=exit
    }
}

export const getters = {
    getManifest: state => state.manifest,
    getRedirectFrom: state => state.redirectFrom,
    getExit: state => state.exit
}