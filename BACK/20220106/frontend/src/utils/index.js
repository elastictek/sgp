export  const getFilterRangeValues=(data)=>{
    var ret =[];
    if (!data?.startValue && !data?.endValue){
        return undefined;
    }
    if (data?.startValue){
        ret.push(`>=${data.startValue}`);
    }
    if (data?.endValue){
        ret.push(`<=${data.endValue}`);
    }
    return ret; 
}