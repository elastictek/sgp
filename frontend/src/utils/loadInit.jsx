export default (init, store = {}, props = {}, state = {}, fields) => {
    let df = { ...init };
    console.log(state,store)
    for (let v of fields) {
        console.log("====>>>>>",v,store,state);
        if (store?.tstamp && state?.tstamp) {
            if (store.tstamp > state.tstamp) {
                if (props && props[v]) { df[v] = props[v]; }
                if (state && state[v]) { df[v] = state[v]; }
                if (store && store[v]) { df[v] = store[v]; }
            } else {
                if (props && props[v]) { df[v] = props[v]; }
                if (store && store[v]) { df[v] = store[v]; }
                if (state && state[v]) { df[v] = state[v]; }
            }
        } else {
            if (store?.tstamp) {
                if (props && props[v]) { df[v] = props[v]; }
                if (store && store[v]) { df[v] = store[v]; }
                if (state && state[v]) { df[v] = state[v]; }
            }else{
                if (props && props[v]) { df[v] = props[v]; }
                if (store && store[v]) { df[v] = store[v]; }
                if (state && state[v]) { df[v] = state[v]; }
            }
        }

    }
    return df;
}