import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import styled from 'styled-components';
import dayjs from 'dayjs';
import Joi from 'joi';
import { fetch, fetchPost } from "utils/fetch";
import { API_URL } from "config";
import { getSchema } from "utils/schemaValidator";
import { FormLayout, Field, FieldSet, FieldItem, AlertsContainer, Item, SelectField, CheckboxField, HorizontalRule, VerticalSpace, InputAddon, SelectDebounceField } from "components/formLayout";
import AlertMessages from "components/alertMessages";
import ResultMessage from 'components/resultMessage';
import Portal from "components/portal";
import { Input, Space, Form, Button, InputNumber, DatePicker, Select, Spin, Typography } from "antd";
import { DATE_FORMAT, DATETIME_FORMAT } from 'config';
import { useDataAPI } from "utils/useDataAPI";
import Table, { setColumns } from "components/table";
const { Title } = Typography;

const setId = (id) => {
    if (id) {
        return { key: "update", values: { id } };
    }
    return { key: "insert", values: {} };
}

export default ({ record, setFormTitle, parentRef, closeParent, parentReload, forInput = true }) => {
    const [loading, setLoading] = useState(true);
    const [guides, setGuides] = useState(false);
    const [operation, setOperation] = useState(setId(record.agg_of_id));
    const dataAPI = useDataAPI({
        payload: {
            url: `${API_URL}/tempaggofabricoitemsget/`, parameters: {}, pagination: { enabled: false }, filter: { agg_of_id: record.agg_of_id }, sort: []
        }
    });

    const columns = setColumns(
        {
            dataAPI,
            data: dataAPI.getData().rows,
            uuid: "ofabricoitems",
            include: {
                ...((common) => (
                    {
                        of_id: { title: "Ordem Fabrico", width: 140, render: v => <b>{v}</b>, ...common },
                        item_cod: { title: "Artigo", width: 140, render: v => <b>{v}</b>, ...common }
                    }
                ))({ idx: 1, optional: false, sort: false })
            },
            exclude: []
        }
    );


    const init = () => {
        (async () => {
            dataAPI.first();
            dataAPI.fetchPost();
            setLoading(false);
        })();
    }

    useEffect(() => {
        init();
    }, []);

    const selectionRowKey = (record) => {
        return `${record.id}`;
    }

    return (
        <>
            <Table
                //title={<Title level={4}>Ordens de Fabrico</Title>}
                columnChooser={false}
                reload
                clearSort={false}
                stripRows
                darkHeader={false}
                size="small"
                selection={{ enabled: false, rowKey: record => selectionRowKey(record) }}
                dataAPI={dataAPI}
                columns={columns}
                onFetch={dataAPI.fetchPost}
            //scroll={{ x: '100%', y: "75vh", scrollToFirstRowOnChange: true }}
            />
        </>
    );
}