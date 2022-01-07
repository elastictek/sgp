import React from 'react';
import { Alert } from "antd";

export default ({ formStatus = {} }) => {
    const { error = [], warning = [], info = [], success = [] } = formStatus;

    console.log("#alert--messages", formStatus);

    return (<>

        {/*  <Space size={20}>
            {
                error.length > 0 && <Badge count={error.length}>
                    <Tag color="error">Erros</Tag>
                </Badge>
            }
            {
                warning.length > 0 && <Badge count={warning.length}>
                    <Tag color="warning">Avisos</Tag>
                </Badge>
            }
            {
                info.length > 0 && <Badge count={info.length}>
                    <Tag color="processing">Informações</Tag>
                </Badge>
            }
        </Space>
 */}
        {formStatus !== undefined &&
            <>
                {
                    error.length > 0 && <Alert type="error" closable message="Erros no Formulário" showIcon={true} description={
                        error.map((v, i) => <div key={`w-${i}`}>{v.message}</div>)
                    } style={{ marginBottom: "8px" }} />
                }
                {
                    warning.length > 0 && <Alert type="warning" closable message="Avisos no Formulário" showIcon={true} description={
                        warning.map((v, i) => <div key={`w-${i}`}>{v.message}</div>)
                    } style={{ marginBottom: "8px" }} />
                }
                {
                    info.length > 0 && <Alert type="info" closable message="Informações no Formulário" showIcon={true} description={
                        info.map((v, i) => <div key={`i-${i}`}>{v.message}</div>)
                    } style={{ marginBottom: "8px" }} />
                }
                {
                    success.length > 0 && <Alert type="success" closable message="" showIcon={true} description={
                        success.map((v, i) => <div key={`i-${i}`}>{v.message}</div>)
                    } style={{ marginBottom: "8px" }} />
                }
            </>
        }
    </>);
}