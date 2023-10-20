import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost, serverPost, cancelToken } from "utils/fetch";
import { WrapperForm, TitleForm, FormLayout, Field, FieldSet, Label, LabelField, FieldItem, AlertsContainer, Item, SelectField, InputAddon, VerticalSpace } from "components/formLayout";
import Toolbar from "components/toolbar";
import { Button, Upload, message, Spin } from "antd";
const { Dragger } = Upload;
import { LoadingOutlined, EditOutlined, UploadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { API_URL, ROOT_URL, DOWNLOAD_URL, DATE_FORMAT, DATETIME_FORMAT, CSRF, MAX_UPLOAD_SIZE, TIPOANEXOS_OF, MEDIA_URL } from 'config';
//import FormAttachementsUpsert from '../attachments/FormAttachementsUpsert';
import { OFabricoContext } from './FormOFabricoValidar';

const loadAttachments = async ({ of_id, token }) => {
    const { data: { rows } } = await fetchPost({ url: `${API_URL}/ofattachmentsget/`, filter: { of_id }, sort: [], cancelToken: token });
    return rows;
}

const StyledFile = styled.div`
    display:flex;
    flex-direction:row;
    margin:2px;
    font-size:11px;
    padding-bottom:2px;
    border-bottom:solid 1px #f5f5f5;
    align-items: center;

    &:hover,
    &:focus {
        background-color: #f5f5f5;
    }
    .itemtype{
        flex-basis: 180px;
	    flex-grow: 0;
	    flex-shrink: 0;
    }
    .itemfile{
        flex:1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .itemfile span{
        color:#2f54eb;
        cursor:pointer;
        font-weight:700;
    }
    .itemremove{
        flex-basis: 30px;
        flex-grow: 0;
        flex-shrink: 0;
        cursor:pointer;
    }
    .itemremove span:hover{
        color:red;
    }
`;

const StyledDragger = styled(Dragger)`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-top: 1px solid gray;

    .ant-upload.ant-upload-drag{
        width: 80%;
        margin: 20px;
    }
    .ant-upload-list.ant-upload-list-picture{
        width: 100%;
        margin: 20px;
    }
    .ant-upload-list{
        width: 100%;
        border-radius: 2px;
        padding: 10px;
        /*border:solid 1px gray;*/
    }
`;

const File = ({ originNode, file, currFileList, onRemove, attachmentType, setAttachmentType }) => {

    const onTypeChange = (value, option) => {
        setAttachmentType(prev => ({ ...prev, [file.uid]: value }));
    }

    return (
        <StyledFile>
            <div className="itemtype"><SelectField onChange={onTypeChange} defaultValue={TIPOANEXOS_OF[0].key} style={{ width: "170px" }} size="small" data={TIPOANEXOS_OF} keyField="value" textField="value"
                optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
            /></div>
            <div className="itemfile">{file.name}</div>
            <div className="itemremove" onClick={() => onRemove(file)}><DeleteOutlined /></div>
        </StyledFile>
    );
}

const AttachmentsList = ({ attachments, setLoading, loadData }) => {
    const [changedTypes, setChangedTypes] = useState({});

    const onRemove = (id) => {
        setChangedTypes((prev) => {
            const newchanges = { ...prev }
            delete newchanges[id];
            return newchanges;
        });
        setLoading(true);
        serverPost({ url: `${API_URL}/ofattachmentschange/`, parameters: { type: "remove", id } }).then(function (response) {
            loadData();
            console.log("data", response.data);
        }).catch(function (error) {
            message.error("Erro ao Remover Anexo!");
        }).finally(() => {
            setLoading(false);
        });
    }
    const onTypeChange = (id, value) => {
        setChangedTypes(prev => ({ ...prev, [id]: value }));
    }
    const saveChanges = () => {
        setLoading(true);
        serverPost({ url: `${API_URL}/ofattachmentschange/`, parameters: { type: "changedtypes", changedTypes } }).then(function (response) {
            console.log("data", response.data);
        }).catch(function (error) {
            message.error("Erro ao Alterar Anexos!");
        }).finally(() => {
            setLoading(false);
        });
    }

    const urlAttachemnt = (p)=>{
        if (p.id === null) {
            return `${ROOT_URL}${MEDIA_URL}/${encodeURI(p.path)}`;
        } else {
            return `${ROOT_URL}${API_URL}${DOWNLOAD_URL}/?i=${p.of_id}&t=${encodeURI(p.tipo_doc)}&f=${encodeURI(p.path.split("/").slice(1).join('/'))}`;
        }
        //console.log(" ---- ",p,`${ROOT_URL}${API_URL}${DOWNLOAD_URL}/?i=${p.of_id}&t=${encodeURI(p.tipo_doc)}&f=${encodeURI(p.path.split("/").slice(1).join('/'))}`);
        //console.log(API_URL," -- ", MEDIA_URL," --- ",p.path.split("/").slice(1).join('/'))
        //${MEDIA_URL}/${v.path.split("/").slice(1).join('/')}
        //return `${ROOT_URL}${API_URL}${DOWNLOAD_URL}/?i=${p.of_id}&t=${encodeURI(p.tipo_doc)}&f=${encodeURI(p.path.split("/").slice(1).join('/'))}`;
    }

    return (
        <>
            <Toolbar
                style={{ width: "100%" }}
                right={<Button type="primary" disabled={Object.keys(changedTypes).length == 0 ? true : false} onClick={saveChanges}>Guardar Alterações</Button>}
            />
            {attachments.map(v => <StyledFile key={`attf-${v.id}`}>
                <a className="itemfile" href={urlAttachemnt(v)} target="_blank"><span>{v.path.split("/").pop()}</span></a>
                <div className="itemtype"><SelectField onChange={(val, o) => onTypeChange(v.id, val)} defaultValue={v.tipo_doc} style={{ width: "170px" }} size="small" data={TIPOANEXOS_OF} keyField="value" textField="value"
                    optionsRender={(d, keyField, textField) => ({ label: d[textField], value: d[keyField] })}
                /></div>
                <div className="itemremove" onClick={() => onRemove(v.id)}><DeleteOutlined /></div>
            </StyledFile>
            )}
        </>
    );
}


export default ({ record, setFormTitle }) => {
    const { form, guides, schema, fieldStatus, ...ctx } = useContext(OFabricoContext);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState({ show: false });
    const [fileList, setFileList] = useState([]);
    const [attachmentType, setAttachmentType] = useState({});
    const [uploading, setUploading] = useState(false);
    const [attachments, setAttachments] = useState([]);
    //const [artigosSpecs, setArtigosSpecs] = useState([]);

    useEffect(() => {
        (setFormTitle) && setFormTitle({ title: `Anexos ${record.aggItem.cliente_nome}`, subTitle: `${record.aggItem.of_id} - ${record.aggItem.item_cod}` });
        const cancelFetch = cancelToken();
        loadData({ token: cancelFetch });
        return (() => cancelFetch.cancel("Form Attachements Cancelled"));
    }, []);

    const loadData = ({ token } = {}, type = "init") => {
        const { of_id, tempof_id } = record.aggItem;
        switch (type) {
            default:
                if (!loading) {
                    setLoading(true);
                }
                (async () => {
                    setAttachments(await loadAttachments({ of_id: tempof_id, token }));
                    setFileList([]);
                    setAttachmentType({});
                    setUploading(false);
                    setLoading(false);
                })();
        }
    }

    const onShowForm = (newForm = false, forInput = false) => {
        if (newForm) {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: {}, forInput }));
        } else {
            setShowForm(prev => ({ ...prev, show: !prev.show, record: { ...form.getFieldsValue(["artigospecs_id", "artigoSpecs", "artigoSpecsItems"]) }, forInput }));
        }
    }

    const onChange = ({ newFileList }) => {
        //setFileList(newFileList);
    };


    const beforeUpload = (file, fl) => {
        const flst = [];
        const filesType = {};
        for (const f of fl) {
            const isSize = f.size / 1024 / 1024 < MAX_UPLOAD_SIZE;
            if (!isSize) {
                message.error(`O ficheiro tem de ser inferior a ${MAX_UPLOAD_SIZE}MB!`);
            } else {
                if (f.uid) {
                    filesType[f.uid] = TIPOANEXOS_OF[0].key;
                }
                flst.push(f);
            }
        }
        setAttachmentType(prev => ({ ...prev, ...filesType }));
        setFileList([...fileList, ...flst]);
        return false;
    }

    const onRemove = (file) => {
        setAttachmentType((prev) => {
            const newtypes = { ...prev }
            delete newtypes[file.uid];
            return newtypes;
        });
        setFileList(prev => {
            const index = prev.indexOf(file);
            const newFileList = prev.slice();
            newFileList.splice(index, 1);
            return newFileList;
        });
    }

    const handleUpload = () => {
        const { of_id, tempof_id } = record.aggItem;
        const formData = new FormData();
        formData.append("of_id", of_id);
        formData.append("tempof_id", tempof_id);

        fileList.forEach(file => {
            formData.append(file.uid, file);
            formData.append(`${file.uid}_type`, attachmentType[file.uid]);
        });

        setUploading(true);

        serverPost({ url: `${API_URL}/ofupload/`, parameters: formData, headers: { "Content-type": "multipart/form-data" } }).then(function (response) {
            message.success(response.data.title);
        }).catch(function (error) {
            message.error("Erro ao submeter os Ficheiros!");
            console.log(error);
        }).finally(() => {
            loadData();
        });
    };


    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="A carregar...">
                <FormLayout
                    id="LAY-ARTIGOSPECS"
                    guides={guides}
                    layout="vertical"
                    style={{ width: "100%", padding: "0px"/* , minWidth: "700px" */ }}
                    schema={schema}
                    field={{
                        //wide: [3, 2, 1, '*'],
                        margin: "2px", overflow: false, guides: guides,
                        label: { enabled: true, pos: "top", align: "start", vAlign: "center", width: "120px", wrap: false, overflow: false, colon: true, ellipsis: true },
                        alert: { pos: "right", tooltip: true, container: true /* container: "el-external" */ },
                        layout: { top: "", right: "", center: "", bottom: "", left: "" },
                        addons: {}, //top|right|center|bottom|left
                        required: true,
                        style: { alignSelf: "top" }
                    }}
                    fieldSet={{
                        guides: guides,
                        wide: 16, margin: "2px", layout: "horizontal", overflow: false
                    }}
                >
                    <FieldSet wide={16} margin={false} layout="vertical">
                        <AttachmentsList attachments={attachments} setLoading={setLoading} loadData={loadData}/>
                    </FieldSet>
                    <VerticalSpace />
                    <FieldSet wide={16} margin={false} layout="vertical">
                        <StyledDragger
                            method='post'
                            action={`${API_URL}/ofupload/`}
                            headers={{ "X-CSRFToken": CSRF }}
                            withCredentials={true}
                            fileList={fileList}
                            onChange={onChange}
                            maxCount={10}
                            beforeUpload={beforeUpload}
                            multiple
                            onRemove={onRemove}
                            itemRender={(originNode, file, currFileList) => (
                                <File originNode={originNode} file={file} currFileList={currFileList} onRemove={onRemove} attachmentType={attachmentType} setAttachmentType={setAttachmentType} />
                            )}
                            >
                            <div className="ant-upload-drag-icon">
                                <InboxOutlined style={{ /* color: "green" */ }} />
                            </div>
                            <div className="ant-upload-text">Arraste os Ficheiros a submeter</div>
                        </StyledDragger>

                        {/* <Upload
                            method='post'
                            action={`${API_URL}/ofupload/`}
                            headers={{ "X-CSRFToken": CSRF }}
                            withCredentials={true}
                            fileList={fileList}
                            onChange={onChange}
                            maxCount={10}
                            beforeUpload={beforeUpload}
                            multiple
                            onRemove={onRemove}
                            itemRender={(originNode, file, currFileList) => (
                                <File originNode={originNode} file={file} currFileList={currFileList} onRemove={onRemove} attachmentType={attachmentType} setAttachmentType={setAttachmentType} />
                            )}
                        >
                            <Button icon={<UploadOutlined />}>Selecionar Ficheiro(s)</Button>
                        </Upload> */}
                        <Button
                            type="primary"
                            onClick={handleUpload}
                            disabled={fileList.length === 0}
                            loading={uploading}
                            style={{ marginTop: 16 }}
                        >
                            {uploading ? 'A submeter...' : 'Submeter'}
                        </Button>
                    </FieldSet>
                    {/* <FieldSet>
                        <Toolbar
                            style={{ width: "100%" }}
                            left={
                                <FieldSet>
                                    <Field name="artigospecs_id" layout={{ center: "align-self:center;", right: "align-self:center;" }} label={{ enabled: true, text: "Especificações", pos: "left" }} addons={{
                                        ...(form.getFieldValue("artigospecs_id") && { right: <Button onClick={() => onShowForm(false,true)} style={{ marginLeft: "3px" }} size="small"><EditOutlined style={{ fontSize: "16px" }} /></Button> })
                                    }}>
                                        <SelectField size="small" data={artigosSpecs} keyField="id" textField="designacao"
                                            optionsRender={(d, keyField, textField) => ({ label: <div style={{ display: "flex" }}><div style={{ minWidth: "150px" }}><b>{d[textField]}</b></div><div>v.{d["versao"]}</div></div>, value: d[keyField] })}
                                        />
                                    </Field>
                                </FieldSet>
                            }
                            right={<Button onClick={() => onShowForm(true,true)}>Novas Especificações</Button>}
                        />
                    </FieldSet>
                    <FieldSet>
                        {(!loading && form.getFieldValue("artigospecs_id")) && <FormSpecsUpsert record={form.getFieldsValue(true)} wrapForm={false} forInput={false} parentReload={loadData} />}
                    </FieldSet> */}
                </FormLayout>
            </Spin>
        </>
    );
}