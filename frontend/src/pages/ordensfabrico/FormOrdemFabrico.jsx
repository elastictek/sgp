import React, { useEffect, useState, useCallback, useRef, useContext } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import Joi, { alternatives } from 'joi';
import { allPass, curry, eqProps, map, uniqWith } from 'ramda';
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { fetch, fetchPost, cancelToken } from "utils/fetch";
import { getSchema, pick, getStatus, validateMessages } from "utils/schemaValidator";
import { useSubmitting } from "utils";
import loadInit, { fixRangeDates } from "utils/loadInit";
import { API_URL } from "config";
import { useDataAPI } from "utils/useDataAPI";
import Toolbar from "components/toolbar";
import { getFilterRangeValues, getFilterValue, secondstoDay } from "utils";
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
import ToolbarTitle from 'components/ToolbarTitle';
import YScroll from 'components/YScroll';
import { usePermission, Permissions } from "utils/usePermission";


const TitleForm = ({ ofabrico }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
      <div><ExclamationCircleOutlined style={{ color: "#faad14" }} /></div>
      <div style={{ fontSize: "14px", display: "flex", flexDirection: "column" }}>
        <div style={{ fontWeight: 800 }}>Validar Ordem de Fabrico</div>
        <div style={{ color: "#1890ff" }}>{ofabrico}</div>
      </div>
    </div>
  );
}

const schema = (options = {}) => {
  return getSchema({
    produto_cod: Joi.string().label("Designação do Produto").required(),
    artigo_formu: Joi.string().label("Fórmula").required(),
    artigo_nw1: Joi.string().label("Nonwoven 1").required(),
    typeofabrico: Joi.number().integer().min(0).max(2).label("Tipo Ordem de Fabrico").required(),
    artigo_width: Joi.number().integer().min(1).max(5000).label("Largura").required(),
    artigo_diam: Joi.number().integer().min(1).max(5000).label("Diâmetro").required(),
    artigo_core: Joi.number().integer().valid(3, 6).label("Core").required(),
    artigo_gram: Joi.number().integer().min(1).max(1000).label("Gramagem").required(),
    artigo_thickness: Joi.number().integer().min(0).max(5000).label("Espessura").required()
  }, options).unknown(true);
}

const loadTeste = async (aggId) => {
  const { data: { exists } } = await fetchPost({ url: `${API_URL}/ordensfabrico/sql/`, pagination: { enabled: false }, filter: { aggId }, parameters: { method: "GetEstadoProducao" } });
  return exists;
}

export default ({ parameters, extraRef, closeSelf, loadParentData, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  //const permission = usePermission({ allowed: { producao: 100, planeamento: 100 } });//Permissões Iniciais
  //const [allowEdit, setAllowEdit] = useState({ form: false, datagrid: false });//Se tem permissões para alterar (Edit)
  //const [modeEdit, setModeEdit] = useState({ form: false, datagrid: false }); //Se tem permissões para alternar entre Mode Edit e View
  const [fieldStatus, setFieldStatus] = useState({});
  const [formStatus, setFormStatus] = useState({ error: [], warning: [], info: [], success: [] });
  const [form] = Form.useForm();
  const [formFilter] = Form.useForm();
  const defaultFilters = {};
  const defaultSort = []; //{ column: "colname", direction: "ASC|DESC" }
  const defaultParameters = {};
  const dataAPI = useDataAPI({ /* id: "id", */ payload: { url: `${API_URL}/api_to_call/`, parameters: defaultParameters, pagination: { enabled: true, page: 1, pageSize: 20 }, filter: defaultFilters, sort: defaultSort } });
  const dataAPIArtigos = useDataAPI({ /* id: "id", */ payload: { parameters: {}, pagination: { enabled: false }, filter: {}, sort: [] } });
  const submitting = useSubmitting(true);
  const permission = usePermission({ name: "ordemfabrico" });
  const [clienteExists, setClienteExists] = useState(false);
  const primaryKeys = [];
  const containerRef = useRef();
  // const { lastJsonMessage, sendJsonMessage } = useWebSocket(`${SOCKET.url}/realtimegeneric`, {
  //   onOpen: () => console.log(`Connected to Web Socket generic`),
  //   queryParams: { /* 'token': '123456' */ },
  //   onError: (event) => { console.error(event); },
  //   shouldReconnect: (closeEvent) => true,
  //   reconnectInterval: 5000,
  //   reconnectAttempts: 500
  // });



  useEffect(() => {
    const controller = new AbortController();
    loadData({ signal: controller.signal });
    return (() => controller.abort());
  }, []);

  const loadData = async ({ signal } = {}) => {
    submitting.trigger();
    if (parameters?.temp_ofabrico_agg) {
      await loadTeste(parameters?.temp_ofabrico_agg);
      //sendJsonMessage({ cmd: 'getEstadoProducao', value: { aggId: parameters?.temp_ofabrico_agg } });
    }
    // if (parameters?.data?.rows) {
    //   const _dj = Object.values(parameters?.data?.rows.reduce((acc, cur) => {
    //     if (!acc[cur.gid]) {
    //       acc[cur.gid] = { ...cur, stock: cur.current_stock == 1 ? cur : {} };
    //     } else {
    //       if (cur.current_stock == 1) {
    //         acc[cur.gid].stock = cur;
    //       } else {
    //         //acc[cur.gid].a += cur.a;
    //       }
    //     }

    //     //totals
    //     acc[cur.gid].timestamp = parameters?.data?.timestamp;
    //     acc[cur.gid].paletizacao = { ...json(parameters?.data?.current?.paletizacao).find(v => v.of_cod == acc[cur.gid]?.of_cod) };
    //     acc[cur.gid].bobines = parameters?.data?.bobines?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].bobines_nopalete = parameters?.data?.bobines_nopalete?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].bobines_retrabalhadas = parameters?.data?.bobines_retrabalhadas?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].paletes_m2_produzidas = parameters?.data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_produzidos; //Calcula até ao nº de paletes planeados
    //     acc[cur.gid].paletes_m2_produzidas_total = parameters?.data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_produzidos_total; //Calcula todas as paletes produzidas, mesmo passando o planeado
    //     acc[cur.gid].paletes_m2_total = parameters?.data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.num_m2_total; //Calcula todas as paletes produzidas+stock, mesmo passando o planeado
    //     acc[cur.gid].qty_encomenda = parameters?.data?.paletes.find(v => v.ofid == acc[cur.gid]?.of_cod)?.qty_encomenda;
    //     acc[cur.gid].defeitos = parameters?.data?.defeitos?.filter(v => v.ofid == acc[cur.gid]?.of_cod);
    //     acc[cur.gid].num_paletes_of_percentage = getFloat((100 * getFloat(acc[cur.gid].current_num_paletes_of)) / getFloat(acc[cur.gid].num_paletes_of), 0);
    //     acc[cur.gid].total_planned = {
    //       num_paletes: getFloat(acc[cur.gid].num_paletes) * json(acc[cur.gid].lvl).length,
    //       num_bobines: getFloat(acc[cur.gid].num_bobines) * json(acc[cur.gid].lvl).length
    //     };
    //     acc[cur.gid].total_current = {
    //       num_paletes_line: getFloat(acc[cur.gid]?.current_num_paletes),
    //       num_paletes_stock: getFloat(acc[cur.gid]?.stock?.current_num_paletes),
    //       num_bobines_line: getFloat(acc[cur.gid]?.current_num_bobines),
    //       num_bobines_stock: getFloat(acc[cur.gid]?.stock?.current_num_bobines)
    //     }
    //     acc[cur.gid].total_current["num_paletes"] = acc[cur.gid].total_current["num_paletes_line"] + acc[cur.gid].total_current["num_paletes_stock"];
    //     acc[cur.gid].total_current["num_paletes_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_paletes) / (acc[cur.gid].total_planned.num_paletes), 0);
    //     acc[cur.gid].total_current["num_bobines"] = acc[cur.gid].total_current["num_bobines_line"] + acc[cur.gid].total_current["num_bobines_stock"];
    //     acc[cur.gid].total_current["num_bobines_percentage"] = getFloat((100 * acc[cur.gid].total_current.num_bobines) / (acc[cur.gid].total_planned.num_bobines), 0);

    //     return acc;
    //   }, {}));
    //   console.log("ffffffffffffffffff", _dj, parameters?.data)
    //   dataAPI.setData({ rows: _dj, total: _dj.length });

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

  return (
    <FormContainer id="LAY-VAL" fluid forInput={permission.isOk({ item: "changeStatus", action: "validar" })} loading={submitting.state} wrapForm={true} form={form} fieldStatus={fieldStatus} setFieldStatus={setFieldStatus} onFinish={onFinish} onValuesChange={onValuesChange} schema={schema} wrapFormItem={true} alert={{ tooltip: true, pos: "none" }}>
      <Row>
        <Col xs="content">
          <Anchor
            getContainer={() => containerRef.current}
            items={[
              {
                key: 'part-1',
                href: '#part-1',
                title: 'Part 1',
              },
              {
                key: 'part-2',
                href: '#part-2',
                title: 'Part 2',
              },
              {
                key: 'part-3',
                href: '#part-3',
                title: 'Part 3',
              },
            ]}
          />
        </Col>
        <Col style={{ height: "70vh" }}>
          <YScroll ref={containerRef}>
            <div
              id="part-1"
              style={{
                height: '200px',
                background: 'red',
              }}
            />
            <div
              id="part-2"
              style={{
                height: '100vh',
                background: 'green',
              }}
            />
            <div
              id="part-3"
              style={{
                height: '100vh',
                background: 'blue',
              }}
            />
          </YScroll>
        </Col>
      </Row>
      {extraRef && <Portal elId={extraRef.current}>
        {permission.isOk({ item: "changeStatus", action: "validar" }) && <Space>
          {/* <Button disabled={submitting.state} onClick={closeSelf}>Cancelar</Button>
                        <Button disabled={submitting.state} type="primary" onClick={onFinish}>Validar</Button> */}
        </Space>}
      </Portal>
      }
    </FormContainer>
  )

}