export const openNotification = (api)=>(status, placement, message, description) => {
    if (status === "error") {
        api.error({
            message: message ? message : `Notificação`,
            description: description,
            placement
        });
    } else if (status === "success") {
        api.success({
            message: message ? message : `Notificação`,
            description: description,
            placement
        });
    } else {
        api.info({
            message: message ? message : `Notificação`,
            description: description,
            placement
        });
    }
};
