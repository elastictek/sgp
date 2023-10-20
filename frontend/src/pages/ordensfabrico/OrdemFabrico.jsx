import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import { json, includeObjectKeys } from "utils/object";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay, pickAll } from "utils";
import Portal from "components/portal";
import { Button, Spin, Form, Space, Input, InputNumber, Tooltip, Menu, Collapse, Typography, Modal, Select, Tag, DatePicker, Alert, Tabs, Anchor } from "antd";
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title } = Typography;
import { DeleteFilled, AppstoreAddOutlined, PrinterOutlined, SyncOutlined, SnippetsOutlined, CheckOutlined, MoreOutlined, EditOutlined, LockOutlined, PlusCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ResultMessage from 'components/resultMessage';
import Table from 'components/TableV2';
import { DATE_FORMAT, DATETIME_FORMAT, TIPOEMENDA_OPTIONS, SOCKET, FORMULACAO_CUBAS, THICKNESS, GTIN } from 'config';
import uuIdInt from "utils/uuIdInt";
//import { useStyles } from 'components/commons/styleHooks';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';
import { Container, Row, Col, Visible, Hidden } from 'react-grid-system';
import { Field, Container as FormContainer, SelectField, AlertsContainer, RangeDateField, SelectDebounceField, CheckboxField, Selector, Label, HorizontalRule, VerticalSpace } from 'components/FormFields';
import ToolbarTitle from 'components/ToolbarTitleV3';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";
import { estadoProducaoData } from '../producao/WidgetEstadoProducao';
import { AppContext } from 'app';
const FormRequirements = React.lazy(() => import('./FormRequirements'));
const FormCoresPlan = React.lazy(() => import('./FormCoresPlan'));
const FormCortesPlan = React.lazy(() => import('./FormCortesPlan'));
const FormCortes = React.lazy(() => import('./FormCortes'));
const FormArtigosSpecsPlan = React.lazy(() => import('./FormArtigosSpecsPlan'));
const FormFormulacaoPlan = React.lazy(() => import('./FormFormulacaoPlan'));
const FormFormulacao = React.lazy(() => import('./FormFormulacao'));
const FormNwPlan = React.lazy(() => import('./FormNwPlan'));
const FormReport = React.lazy(() => import('./FormReport'));
const FormPaletizacao = React.lazy(() => import('./FormPaletizacao'));
const FormGamaOperatoria = React.lazy(() => import('./FormGamaOperatoria'));

const title = "Ordem de fabrico";
const TitleForm = ({ data, onChange, level, auth, form, ofabrico }) => {
  return (<ToolbarTitle id={auth?.user} description={`${title} ${ofabrico}`} title={<>
    <Col>
      <Row style={{ marginBottom: "5px" }} wrap="nowrap" nogutter>
        <Col xs='content' style={{}}><Row nogutter><Col title={title} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}><span style={{}}>{title} {ofabrico}</span></Col></Row></Col>
        {/* <Col xs='content' style={{ paddingTop: "3px" }}>{st && <Tag icon={<MoreOutlined />} color="#2db7f5">{st}</Tag>}</Col> */}
      </Row>

    </Col>
  </>
  }
  />);
}

const schema = (options = {}) => {
  return getSchema({
    // produto_cod: Joi.string().label("Designação do Produto").required(),
    // artigo_formu: Joi.string().label("Fórmula").required(),
    // artigo_nw1: Joi.string().label("Nonwoven 1").required(),
    // typeofabrico: Joi.number().integer().min(0).max(2).label("Tipo Ordem de Fabrico").required(),
    // artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
    // artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
    // artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
    // artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
    // artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required()
  }, options).unknown(true);
}

export const LeftToolbar = ({ form, dataAPI, permission }) => {
  return (<>
    {/* <Button title='Retroceder' type="link" icon={<LeftOutlined />} onClick={() => navigate(-1)}></Button> */}
  </>);
}

export const RightToolbar = ({ form, dataAPI, permission, edit, ...props }) => {
  useEffect(() => {
    // console.log("-------------------------------->", props,)
  }, []);
  return (
    <Space>
      {/* <Button disabled={!permission.isOk({ action: "printEtiqueta" })} title='Imprimir Etiqueta' icon={<PrinterOutlined />} onClick={() => { }}>Etiqueta</Button>
          <Button disabled={!edit || !permission.isOk({ action: "refazerPalete" })} onClick={() => { }}>Refazer Palete</Button>
          <Button disabled={!edit || !permission.isOk({ action: "pesarPalete" })} icon={<FaWeightHanging />} onClick={() => { }}>Pesar Palete</Button> */}
    </Space>
  );
}

const ToolbarTable = ({ form, modeEdit, allowEdit, submitting, changeMode, permission }) => {
  const navigate = useNavigate();

  const onChange = (v, field) => {


  }

  const leftContent = (<>
    {/* <Space>
          {modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<LockOutlined title="Modo de Leitura" />} onClick={()=>changeMode('formPalete')} />}
          {!modeEdit?.formPalete && <Button disabled={(!allowEdit.formPalete || submitting.state)} icon={<EditOutlined />} onClick={()=>changeMode('formPalete')}>Editar</Button>}
      </Space> */}
    <LeftToolbar permission={permission} />
  </>);

  const rightContent = (
    <Space>
      <RightToolbar permission={permission} />
    </Space>
  );
  return (
    <Toolbar left={leftContent} right={rightContent} />
  );
}

const loadOrdemFabrico = async (agg_of_id, ordem_id, draft_ordem_id) => {
  const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { enabled: false }, filter: { agg_of_id, ordem_id, draft_ordem_id }, parameters: { method: "GetOrdemFabricoSettings" } });
  return rows;
}

export const loadEstadoProducao = async (agg_of_id, ordem_id) => {
  const { data: { rows } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { enabled: false }, filter: { agg_of_id, ordem_id }, parameters: { method: "GetEstadoProducao" } });
  return rows;
}

export const Edit = ({ editable, action, item, permissions, editKey, onEdit, onEndEdit, onCancelEdit, resetData, fn, ...props }) => {
  return (
    <Permissions permissions={permissions} item={item} action={action} forInput={editable}>
      {editKey === null && <Button onClick={() => onEdit(action)} type="link" icon={<EditOutlined />}>Editar</Button>}
      {editKey === action && <Button onClick={() => onCancelEdit(resetData)} type="link">Cancelar</Button>}
      {editKey === action && <Button onClick={() => onEndEdit(fn)} type="primary" icon={<EditOutlined />}>Guardar</Button>}
    </Permissions>
  );
}

export const load = async (current) => {
  const _data = await loadOrdemFabrico(current?.temp_ofabrico_agg, current?.ofabrico_sgp, current?.temp_ofabrico);
  const formulacao_plan = includeObjectKeys(_data, ["fplan_%"]);
  const cortes_plan = includeObjectKeys(_data, ["cplan_%"]);
  //const _data = await loadEstadoProducao(inputParameters.current.temp_ofabrico_agg, inputParameters.current.ofabrico_sgp);
  //const _ep = estadoProducaoData({ data: _data }); //calcula os valores de cada estado de produção por of
  //console.log("---------------",_ep)
  return {
    ...current, ...formulacao_plan, ...cortes_plan, cortesordem_id: json(_data?.cortesordem)?.id, cortes_id: json(_data?.cortes)?.id, formulacao_id: json(_data?.formulacao)?.id,
    paletizacao_id: json(json(_data.paletizacao))?.id,
    ...pickAll([{ id: "cs_id" }, "sentido_enrolamento", "amostragem", "observacoes", "agg_of_id", "formulacao_plan_id", "fplan_", "cortes_plan_id", "cplan_"], _data),
    of: json(_data.ofs), emendas: json(_data.emendas),
    hasPaletizacao: json(json(_data.paletizacao))?.id ? true : false
  };
}

export default ({ extraRef, closeSelf, loadParentData, setFormTitle, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openNotification } = useContext(AppContext);
  //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
  //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
  //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
  const [fieldStatus, setFieldStatus] = useState({});
  const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
  const [form] = Form.useForm();
  const [formFilter] = Form.useForm();
  const inputParameters = useRef({});
  const defaultFilters = {};
  const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
  const defaultParameters = {};
  const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
  const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
  const submitting = useSubmitting(true);
  const permission = usePermission({ name: "ordemfabrico" });
  const [estadoProducao, setEstadoProducao] = useState();
  const [ofExists, setOfExists] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [editKey, setEditKey] = useState(null);
  const [updated, setUpdated] = useState(null);
  const [formDirty, setFormDirty] = useState(false);
  const primaryKeys = [];
  const operationsRef = useRef();


  useEffect(() => {
    const controller = new AbortController();
    loadData({ signal: controller.signal, init: true });
    return (() => controller.abort());
  }, []);

  const loadData = async ({ signal, init = false } = {}) => {
    submitting.trigger();
    setFormDirty(false);
    if (init) {
      const { tstamp, ...paramsIn } = loadInit({}, { /* ...dataAPI.getAllFilter(), */ tstamp: dataAPI.getTimeStamp() }, props?.parameters, location?.state, null);
      inputParameters.current = { ...paramsIn };
    }
    
    
    if (inputParameters.current.temp_ofabrico_agg) {
      inputParameters.current = load(inputParameters.current);
      console.log("WWWWWWWWWWdddWWWWWWWWWWWW", json(json(_data.paletizacao)));
      setUpdated(Date.now());
      setOfExists(true);


      // setEstadoProducao(_ep);
      // const unique = Object.values(_ep.rows.reduce((lookup, v) => {
      //   lookup[v.of_cod] = ({
      //     key: v.of_cod, href: `#${v.of_cod}`, parameters: {
      //       ...v,
      //       start_prev_date: inputParameters.current?.start_prev_date,
      //       end_prev_date: inputParameters.current?.end_prev_date,
      //       inicio: inputParameters.current?.inicio,
      //       fim: inputParameters.current?.fim,
      //       current: _data?.current
      //     }, title: <div>
      //       <div style={{ fontWeight: 700 }}>{v.of_cod}</div>
      //       <div style={{ fontSize: "10px" }}>{v.cliente_nome}</div>
      //       <div style={{ fontWeight: 700, fontSize: "11px" }}>{v.artigo_cod}</div>
      //     </div>
      //   });
      //   return lookup;
      // }, {}));
      // setItemsAnchor([...unique]);

    }


    // const formValues = await loadBobinagensLookup(inputParameters.current.bobinagem_id);
    // const v = formValues.length > 0 ? json(formValues[0].artigo)[0] : {};
    // const _ofs = formValues.length > 0 ? json(formValues[0].ofs) : [];
    // form.setFieldsValue(formValues.length > 0 ? { ...formValues[0], core: v?.core, ofs: _ofs, timestamp: dayjs(formValues[0].timestamp) } : {});
    // if (formValues.length > 0 && formValues[0]?.artigo) {
    //   dataAPIArtigos.setRows(json(formValues[0].artigo));
    // }
    submitting.end();
  }

  const onFinish = async (type = 'validar') => {
    const values = form.getFieldsValue(true);
    submitting.trigger();


    submitting.end();
  }

  const onValuesChange = (changedValues, values) => {
    if ("YYYY" in changedValues) {
      //console.log(changedValues)
      //form.setFieldsValue("YYYY", null);
    }
  }

  const onTabChange = (k) => {
    //Guarda a tab selecionada no parent, por forma a abrir sempre no último selecionado.
    if (props?.setTab) { props.setTab(k); }
    setActiveTab(k);
  }

  const onEdit = (key) => {
    if (editKey !== null) {
      openNotification("error", 'top', "Notificação", "Não é possível editar o registo. Existe uma edição em curso!");
    } else {
      setEditKey(key);
      setFormDirty(false);
    }
  }

  const onEndEdit = async (fn) => {
    if (formDirty || typeof fn === "function") {
      switch (editKey) {
        case "planificacao": break;
        case "formulacao":
          if (typeof fn == "function") {
            submitting.trigger();
            await fn();
            submitting.end();
          }
          break;
        case "formulacao_plan":
          if (typeof fn == "function") {
            submitting.trigger();
            await fn();
            submitting.end();
          }
          break;
        default:
          if (typeof fn == "function") {
            submitting.trigger();
            await fn();
            submitting.end();
          }
          break;
      }
    }
    setEditKey(null);
    setFormDirty(false);
  }

  const onCancelEdit = async (resetData) => {
    await resetData();
    setEditKey(null);
    setFormDirty(false);
  }

  const isEditable = (allowOnPrfOpen = false, minStatus = 1) => {
    if (allowOnPrfOpen) {
      return ((inputParameters.current?.ofabrico_status >= minStatus && inputParameters.current?.ofabrico_status < 9) || (inputParameters.current?.ativa == 1));
    } else {
      return (inputParameters.current?.ofabrico_status >= minStatus && inputParameters.current?.ofabrico_status < 9);
    }
  }

  return (
    <>{(!setFormTitle && ofExists) && <TitleForm auth={permission.auth} ofabrico={inputParameters.current?.ofabrico} /* data={dataAPI.getFilter(true)} */ /* onChange={onFilterChange} */ level={location?.state?.level} /* form={formFilter} */ />}
      <FormContainer id="lay-of" fluid wrapForm={false} style={{ padding: "0px", margin: "0px" }}>
        <Row nogutter style={{ padding: "0px", margin: "0px 5px 0px 0px" }}>
          <Col style={{ height: "calc(100vh - 130px)" }}>
            {ofExists &&
              <Tabs size='small' type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                tabBarExtraContent={<div ref={operationsRef}></div>}
                items={[
                  {
                    label: `Informação`,
                    key: '1',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormRequirements activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Paletização`,
                    key: '9',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormPaletizacao activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Cores`,
                    key: '5',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormCoresPlan activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Especificações`,
                    key: '6',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormArtigosSpecsPlan activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  }, {
                    label: `Plan. Cortes`,
                    disabled: !inputParameters.current.hasPaletizacao,
                    key: '7',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormCortesPlan activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Cortes`,
                    disabled: !inputParameters.current.hasPaletizacao,
                    key: '2',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormCortes activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Plan. Formulações`,
                    key: '3',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormFormulacaoPlan activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Formulação`,
                    key: '4',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormFormulacao activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Plan. Nonwovens`,
                    key: '12',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormNwPlan activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Nonwovens`,
                    key: '8',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll></YScroll></div>,
                  },
                  {
                    label: `Gama Operatória`,
                    key: '10',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormGamaOperatoria activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  },
                  {
                    label: `Relatório`,
                    key: '11',
                    children: <div style={{ height: "calc(100vh - 150px)" }}><YScroll><FormReport activeTab={activeTab} {...{ parameters: inputParameters.current, permissions: permission.permissions, parentUpdated: updated }} onValuesChange={onValuesChange} editParameters={{ isEditable, editKey, onEdit, onEndEdit, onCancelEdit, formDirty, setFormDirty }} operationsRef={operationsRef} loadParentData={loadData} /></YScroll></div>,
                  }

                ]}
              />
            }
          </Col>

          {/* <Col xs="content" style={{ marginRight: "10px" }}>
          <Anchor
            getContainer={() => containerRef.current}
            items={itemsAnchor}
          />
        </Col>
        <Col style={{ height: "70vh" }}>
          <YScroll ref={containerRef}>
            {itemsAnchor && itemsAnchor.map((item, index) => (
              <div id={item.key} key={index} style={{
                height: '70vh'
              }}>

                <Tabs size='small' type="card" dark={1} defaultActiveKey="1" activeKey={activeTab} onChange={onTabChange}
                  items={[
                    {
                      label: `Informação`,
                      key: '1',
                      children: <FormRequirements {...{ parameters: item?.parameters, permission }} />,
                    }
                  ]}

                />

              </div>
            ))}
          </YScroll>
        </Col> */}
        </Row>
        {extraRef && <Portal elId={extraRef.current}>
          {permission.isOk({ item: "changeStatus", action: "validar" }) && <Space>
            {/* <Button disabled={submitting.state} onClick={closeSelf}>Cancelar</Button>
                        <Button disabled={submitting.state} type="primary" onClick={onFinish}>Validar</Button> */}
          </Space>}
        </Portal>
        }
      </FormContainer>
    </>
  )

}