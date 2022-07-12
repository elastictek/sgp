export default (init, store = {}, props = {}, state = {}, fields) => {
    let df = { ...init };
    for (let v of fields) {
        if (store?.tstamp && state?.tstamp) {
            if (store.tstamp > state.tstamp) {
                if (props[v]) { df[v] = props[v]; }
                if (state[v]) { df[v] = state[v]; }
                if (store[v]) { df[v] = store[v]; }
            } else {
                if (props[v]) { df[v] = props[v]; }
                if (store[v]) { df[v] = store[v]; }
                if (state[v]) { df[v] = state[v]; }
            }
        } else {
            if (store?.tstamp) {
                if (props[v]) { df[v] = props[v]; }
                if (store[v]) { df[v] = store[v]; }
                if (state && state[v]) { df[v] = state[v]; }
            }else{
                if (props[v]) { df[v] = props[v]; }
                if (store[v]) { df[v] = store[v]; }
                if (state[v]) { df[v] = state[v]; }
            }
        }

    }
    return df;
}