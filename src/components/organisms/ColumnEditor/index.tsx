import React from "react";
import { useUMLEditor } from "../UMLEditor/context";
import { EditorProps, Row } from "../UMLEditor/types";
import styles from "./column-editor.module.scss";
import { slugGenerator } from "@/shared/utils";
import CustomSelect from "./typeSelector";
import { ColumnType, OnDeleteOptions } from "./types";
import EnumSelector from "./enumSelector";
import TableSelector from "./blockSelector";

const ColumnEditor = ({ close }: EditorProps) => {
  const { blocks, setBlocks, editorData } = useUMLEditor();

  const updateRow = (
    data: Record<string, any>,
    rowLevelData?: Record<string, any>,
  ) => {
    if (!editorData?.blockId || editorData?.rowIndex === undefined) {
      return;
    }
    const updatedRows = [...blocks[editorData.blockId].rows];
    updatedRows[editorData.rowIndex] = {
      ...updatedRows[editorData.rowIndex],
      data: {
        ...updatedRows[editorData.rowIndex].data,
        ...data,
      },
      ...rowLevelData,
    };
    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [editorData.blockId]: {
        ...prevBlocks[editorData.blockId],
        rows: updatedRows,
      },
    }));
  };

  const handleNameChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (!editorData?.blockId || editorData?.rowIndex === undefined) {
      return;
    }
    const slug = slugGenerator(value);
    updateRow({ name: value, field_name: slug, id: slug }, { id: slug });
  };

  const handleDelete = () => {
    if (!editorData?.blockId || editorData?.rowIndex === undefined) {
      return;
    }
    setBlocks((prevBlocks) => ({
      ...prevBlocks,
      [editorData.blockId]: {
        ...prevBlocks[editorData.blockId],
        rows: prevBlocks[editorData.blockId].rows.filter(
          (_, index) => index !== editorData.rowIndex,
        ),
      },
    }));
    close();
  };

  if (!editorData?.blockId || editorData?.rowIndex === undefined) {
    console.log(editorData);
    return <>Loading...</>;
  }

  const row = blocks[editorData?.blockId].rows[editorData?.rowIndex];
  if (!row) {
    return <></>;
  }
  const data = row?.data;

  const handleTypeChange = (type: ColumnType) => {
    updateRow({ type });
  };

  if (data.type === ColumnType.PK) {
    close();
  }

  return (
    <>
      <div className={styles["header-container"]}>
        <h3>
          Column Editor :<strong>{data?.name || row.id}</strong>
        </h3>
        <button className="base-button secondary" onClick={handleDelete}>
          Delete
        </button>
      </div>
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          id="name"
          className="base-input"
          placeholder="Enter name"
          value={data?.name || ""}
          onChange={handleNameChange}
        />
      </div>
      <strong>Field name :{data?.field_name}</strong>

      <div className="form-group">
        <label>Field Type</label>
        <CustomSelect value={data.type} onChange={handleTypeChange} />
      </div>

      {data.type === ColumnType.Boolean && (
        <>
          <div className="form-group">
            <label>Default Value</label>
            <input
              className="base-checkbox"
              type="checkbox"
              onChange={({ target: { checked } }) => {
                updateRow({ default: checked });
              }}
              checked={data.default}
            />
          </div>
        </>
      )}

      {(data.type === ColumnType.String ||
        data.type === ColumnType.TextField ||
        data.type === ColumnType.ForeignKey ||
        data.type === ColumnType.PositiveIntegerField ||
        data.type === ColumnType.DateField ||
        data.type === ColumnType.Boolean ||
        data.type === ColumnType.FloatField) && (
        <div className="form-group">
          <label>Can be null ?</label>
          <input
            className="base-checkbox"
            type="checkbox"
            onChange={({ target: { checked } }) => {
              updateRow({ null: checked });
            }}
            checked={data.null}
          />
        </div>
      )}

      {data.type === ColumnType.DateField && (
        <>
          {!data.auto_now && (
            <div className="form-group">
              <label>Auto now add</label>
              <input
                className="base-checkbox"
                type="checkbox"
                onChange={({ target: { checked } }) => {
                  updateRow({ auto_now_add: checked });
                }}
                checked={data.auto_now_add}
              />
            </div>
          )}
          {!data.auto_now_add && (
            <div className="form-group">
              <label>Auto now</label>
              <input
                className="base-checkbox"
                type="checkbox"
                onChange={({ target: { checked } }) => {
                  updateRow({ auto_now: checked });
                }}
                checked={data.auto_now}
              />
            </div>
          )}
        </>
      )}

      {data.type === ColumnType.PositiveIntegerField && (
        <div className="form-group">
          <label>Default</label>
          <input
            className="base-input"
            type="number"
            onChange={({ target: { value } }) => {
              updateRow({ default: value });
            }}
            value={data.default}
          />
        </div>
      )}

      {data.type === ColumnType.FloatField && (
        <div className="form-group">
          <label>Default</label>
          <input
            className="base-input"
            type="number"
            onChange={({ target: { value } }) => {
              updateRow({ default: value });
            }}
            step={0.01}
            value={data.default}
          />
        </div>
      )}

      {(data.type === ColumnType.TextField ||
        data.type === ColumnType.String) && (
        <>
          <div className="form-group">
            <label>Default</label>
            {data.type === ColumnType.String && (
              <input
                className="base-input"
                type="text"
                onChange={({ target: { value } }) => {
                  updateRow({ default: value });
                }}
                value={data.default}
              />
            )}
            {data.type === ColumnType.TextField && (
              <textarea
                className="base-input"
                onChange={({ target: { value } }) => {
                  updateRow({ default: value });
                }}
                rows={10}
                value={data.default}
              />
            )}
          </div>
          {data.type === ColumnType.String && (
            <EnumSelector
              value={data.options_target}
              onChange={(options_target) => {
                updateRow({ options_target });
              }}
            />
          )}
        </>
      )}

      {(data.type === ColumnType.ManyToManyField ||
        data.type === ColumnType.ForeignKey ||
        data.type === ColumnType.OneToOneField) && (
        <>
          <TableSelector
            value={data.target}
            onChange={(target) => {
              updateRow({ target });
            }}
          />
          <div className="form-group">
            <label>Related Name</label>
            <input
              type="text"
              id="name"
              className="base-input"
              value={data?.related_name || ""}
              onChange={({ target: { value } }) => {
                updateRow({ related_name: value });
              }}
            />
          </div>
        </>
      )}
      {data.type === ColumnType.ForeignKey && (
        <div className="form-group">
          <label>What should happen when deleted</label>
          <select
            className="base-select"
            value={data.on_delete}
            onChange={({ target: { value } }) => {
              updateRow({ on_delete: value });
            }}
          >
            <option value={undefined}>Not selected</option>
            {Object.values(OnDeleteOptions).map((opt) => {
              return <option value={opt}>{opt}</option>;
            })}
          </select>
        </div>
      )}
    </>
  );
};

export default ColumnEditor;
