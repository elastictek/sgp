import { isNil } from 'ramda';
import React, { memo, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useImmer } from 'use-immer';

/**Only when edit mode = true, delete is allowed */
const useModeApi = (params) => {
  const [data, updateData] = useImmer({
    isReady: false,
    permissionIsReady:false,
    key: params?.key || "datagrid",
    enabled: params?.enabled || true,
    showControls: params?.showControls || true,
    allowEdit: params?.allowEdit || false,
    allowAdd: params?.allowAdd || false,
    allowDelete: params?.allowDelete || false,
    editText: params?.editText || "Editar",
    addText: params?.addText || "Novo",
    saveText: params?.saveText || "Guardar",
    // onExit: null,
    onEditSave: params?.onEditSave || null,
    onAddSave: params?.onAddSave || null,
    onModeChange: params?.onModeChange || null,
    // onAdd: null,
    mode: params?.initMode ? { "datagrid": { edit: false, add: false, [params?.initMode]: true } } : { ["datagrid"]: { edit: false, add: false } },
    newRow: params?.newRow || null,
    newRowIndex: params?.newRowIndex || null,
    dirty: false,
    initMode: params?.initMode || null
  });

  const EDIT = "edit";
  const ADD = "add"

  //Deprecated
  const load = (_config) => {
    updateData(draft => {
      draft.isReady = true;
      draft.key = _config?.key || "datagrid";
      draft.enabled = _config?.enabled || false;
      draft.showControls = _config?.showControls ?? true;
      draft.allowEdit = _config?.allowEdit || false;
      draft.allowAdd = _config?.allowAdd || false;
      draft.allowDelete = _config?.allowDelete || false;
      draft.editText = _config?.editText || "Editar";
      draft.addText = _config?.addText || "Novo";
      draft.saveText = _config?.saveText || "Guardar";
      // draft.onExit = _config?.onExit;
      draft.onEditSave = _config?.onEditSave;
      draft.onAddSave = _config?.onAddSave;
      draft.onModeChange = _config?.onModeChange;
      // draft.onAdd = _config?.onAdd;
      draft.newRow = _config?.newRow;
      draft.newRowIndex = _config?.newRowIndex;
      draft.mode = _config.initMode ? { [draft.key]: { edit: false, add: false, [_config.initMode]: true } } : { [draft.key]: { edit: false, add: false } };
      draft.dirty = false;
    });
  }

  const setOptions = (options = {}) => {
    updateData((draft) => {
      Object.keys(options).forEach((key) => {
        if (key === "mode") {
          draft[key][draft.key] = { edit: false, add: false, ...{ [options[key]]: true } };
        } else {
          draft[key] = options[key];
        }
      });
    });
  }


  const setDirty = (v = true) => {
    if (isOnMode()) {
      updateData(draft => {
        draft.dirty = v;
      });
    }
  }

  const isOnEditMode = () => {
    if (!data.mode) {
      return false;
    }
    return data.mode[data.key]?.edit;
  }
  const isOnAddMode = () => {
    if (!data.mode) {
      return false;
    }
    return data.mode[data.key]?.add;
  }

  const isOnMode = () => {
    if (!data.mode) {
      return false;
    }
    if (data.mode[data.key]?.add || data.mode[data.key]?.edit) {
      return true;
    }
    return false;
  }

  const onEditMode = async () => {
    if (!data.mode) {
      if (typeof data.onModeChange === "function") {
        data.onModeChange({ add: isOnAddMode(), edit: false });
      }
      return false;
    }
    if (data.enabled && data.allowEdit) {
      if (typeof data.onModeChange === "function") {
        let _change = await data.onModeChange({ add: false, edit: true });
        if (_change===false){
          return false;
        }
      }
        updateData(draft => {
          draft.mode = { [draft.key]: { ...draft.mode[draft.key], edit: !draft.mode[draft.key].edit, add: false } };
          draft.dirty = false;
        });
    }
  }
  const onAddMode = async (fn) => {
    if (!data.mode) {
      if (typeof data.onModeChange === "function") {
        data.onModeChange({ add: false, edit: isOnEditMode() });
      }
      return false;
    }
    if (data.enabled && data.allowAdd) {
      const _row = (typeof data.newRow == "function") ? data.newRow() : {};
      if (typeof data.onModeChange === "function") {
        let _change = await data.onModeChange({ add: true, edit: false },data.newRowIndex, _row);
        if (_change===false){
          return false;
        }
      }

      updateData(draft => {
        draft.mode = { [draft.key]: { ...draft.mode[draft.key], add: !draft.mode[draft.key].add, edit: false } };
        draft.dirty = false;
      });
      
      // if (typeof data?.onAdd == "function") {
      //   data.onAdd(data.newRowIndex, _row);
      // }
      if (typeof fn == "function") {
        updateData(draft => {
          draft.dirty = true;
        });
        fn(data.newRowIndex, _row);
      }
    }
  }

  const _onExit = (fn) => {
    updateData(draft => {
      draft.mode = { [draft.key]: { ...draft.mode[draft.key], add: false, edit: false } };
    });
    // if (typeof data?.onExit == "function") {
    //   data.onExit();
    // }
    if (typeof fn == "function") {
      fn();
    }
    if (typeof data.onModeChange === "function") {
      data.onModeChange({ add: false, edit: false });
    }
  }

  return {
    isReady: () => data.isReady,
    setOptions,
    load,
    onEditMode,
    onAddMode,
    isOnEditMode,
    isOnAddMode,
    isOnMode,
    isDirty: () => data.dirty,
    setDirty,
    allowEdit: () => data?.allowEdit,
    allowAdd: () => data?.allowAdd,
    allowDelete: () => data?.allowDelete,
    editText: () => data?.editText,
    addText: () => data?.addText,
    saveText: () => data?.saveText,
    onExit: (fn) => _onExit(fn),
    onEditSave: async (rows) => await data?.onEditSave(rows),
    onAddSave: async (rows) => await data?.onAddSave(rows),
    onAdd: () => data?.onAdd(),
    enabled: () => data?.enabled,
    showControls: () => data?.showControls,
    EDIT,
    ADD
  }

};

export default useModeApi;