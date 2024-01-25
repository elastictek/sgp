import React, { memo, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useImmer } from 'use-immer';

/**Only when edit mode = true, delete is allowed */
const useModeApi = () => {
  const [data, updateData] = useImmer({
    isReady: false,
    key: "datagrid",
    enabled: false,
    allowEdit: false,
    allowAdd: false,
    allowDelete: false,
    editText: "Editar",
    addText: "Novo",
    saveText: "Guardar",
    // onExit: null,
    onEditSave: null,
    onAddSave: null,
    onModeChange: null,
    // onAdd: null,
    mode: null,
    newRow: null,
    newRowIndex: null,
    dirty: false
  });

  const load = (_config) => {
    updateData(draft => {
      draft.isReady = true;
      draft.key = _config?.key || "datagrid";
      draft.enabled = _config?.enabled || false;
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
      draft.mode = { [draft.key]: { edit: false, add: false } };
      draft.dirty = false;
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
      updateData(draft => {
        draft.mode = { [draft.key]: { ...draft.mode[draft.key], edit: !draft.mode[draft.key].edit, add: false } };
        draft.dirty = false;
      });
      if (typeof data.onModeChange === "function") {
        data.onModeChange({ add: false, edit: true });
      }
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
      updateData(draft => {
        draft.mode = { [draft.key]: { ...draft.mode[draft.key], add: !draft.mode[draft.key].add, edit: false } };
        draft.dirty = false;
      });
      const _row = (typeof data.newRow == "function") ? data.newRow() : {};
      // if (typeof data?.onAdd == "function") {
      //   data.onAdd(data.newRowIndex, _row);
      // }
      if (typeof fn == "function") {
        updateData(draft => {
          draft.dirty = true;
        });
        fn(data.newRowIndex, _row);
      }
      if (typeof data.onModeChange === "function") {
        data.onModeChange({ add: true, edit: false });
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
    enabled: () => data?.enabled
  }

};

export default useModeApi;