import React, { memo, useEffect, useState, useCallback, useRef, useContext, useMemo, forwardRef, useImperativeHandle } from 'react';
import { isEmpty, isNil, assocPath, assoc } from 'ramda';
import { useModal } from "react-modal-hook";
import ResponsiveModal from 'components/Modal';

export default () => {
    const [modalParameters, setModalParameters] = useState({});
    const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
        const content = useCallback(() => {
            return modalParameters.content;
        }, []);
        const onClose = useCallback(() => {
            hideModal();
            if (typeof modalParameters.parameters.gridApi?.setFocusedCell === "function") {
                modalParameters.parameters.gridApi.setFocusedCell(modalParameters.parameters.cellFocus.rowIndex, modalParameters.parameters.cellFocus.colId, null);
            }
        }, []);
        return (
            <ResponsiveModal
                responsive={!isNil(modalParameters?.responsive) ? modalParameters.responsive : true}
                closable={!isNil(modalParameters?.closable) ? modalParameters.closable : true}
                maskClosable={!isNil(modalParameters?.closable) ? modalParameters.closable : true}
                keyboard={!isNil(modalParameters?.closable) ? modalParameters.closable : true}
                lazy={modalParameters?.lazy}
                title={modalParameters?.title}
                type={modalParameters?.type}
                push={modalParameters?.push}
                onCancel={onClose}
                width={modalParameters.width}
                height={modalParameters.height}
                footer="ref"
                yScroll>
                {content()}
            </ResponsiveModal>
        );
    }, [modalParameters]);

    return { setModalParameters, showModal, hideModal };
}