export const openNotification = (api)=>(status, placement, message, description,duration=5) => {
    if (status === "error") {
        api.error({
            message: message ? message : `Notificação`,
            description: description,
            placement,
            duration
        });
    } else if (status === "success") {
        api.success({
            message: message ? message : `Notificação`,
            description: description,
            placement,
            duration
        });
    } else {
        api.info({
            message: message ? message : `Notificação`,
            description: description,
            placement,
            duration
        });
    }
};
