import React, { ReactNode } from "react";
import { EditorProps, Row, useUMLEditor } from "@ginger-society/ginger-ui-uml";
import styles from "./column-editor.module.scss";
import { slugGenerator } from "@/shared/utils";
import CustomSelect from "./typeSelector";
import { ColumnType, OnDeleteOptions } from "./types";
import EnumSelector from "./enumSelector";
import TableSelector from "./blockSelector";
import {
  Input,
  TextArea,
  Text,
  Checkbox,
  Select,
  Button,
  ButtonType,
  Option,
  LoadingPage,
  TextColor,
  ConfirmationButton,
} from "@ginger-society/ginger-ui";

const ColumnEditor = ({ close }: EditorProps): ReactNode => {
  const { blocks, setBlocks, editorData } = useUMLEditor();

  const updateRow = (
    data: Record<string, any>,
    rowLevelData?: Record<string, any>
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
          (_, index) => index !== editorData.rowIndex
        ),
      },
    }));
    close();
  };

  if (!editorData?.blockId || editorData?.rowIndex === undefined) {
    return <LoadingPage />;
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
    <div className={styles["container"]}>
      <div className={styles["header-container"]}>
        <Text>
          Column Editor :<strong>{data?.name || row.id}</strong>
        </Text>
        <ConfirmationButton
          onClick={handleDelete}
          type={ButtonType.Tertiary}
          label={<Text color={TextColor.Danger}>Delete</Text>}
          title = "Are you sure ?"
          description = "This is not reversible"
          confirmButtonLabel= "Yes, I am sure"
          okBtnType = {ButtonType.Danger}
        />
      </div>
      <Input
        type="text"
        id="name"
        label="Name"
        placeholder="Enter name"
        value={data?.name || ""}
        onChange={handleNameChange}
      />
      <Text>Field name :{data?.field_name}</Text>

      <CustomSelect value={data.type} onChange={handleTypeChange} />

      {data.type === ColumnType.Boolean && (
        <Checkbox
          label="True by default ?"
          onChange={(checked) => {
            updateRow({ default: checked });
          }}
          checked={data.default}
        />
      )}

      {(data.type === ColumnType.String ||
        data.type === ColumnType.TextField ||
        data.type === ColumnType.ForeignKey ||
        data.type === ColumnType.PositiveIntegerField ||
        data.type === ColumnType.DateField ||
        data.type === ColumnType.DateTimeField ||
        data.type === ColumnType.Boolean ||
        data.type === ColumnType.FloatField) && (
        <Checkbox
          label="Can be null ?"
          onChange={(checked) => {
            updateRow({ null: checked });
          }}
          checked={data.null}
        />
      )}

      {(data.type === ColumnType.DateField ||
        data.type === ColumnType.DateTimeField) && (
        <>
          {!data.auto_now && (
            <Checkbox
              label="Auto now add"
              onChange={(checked) => {
                updateRow({ auto_now_add: checked });
              }}
              checked={data.auto_now_add}
            />
          )}
          {!data.auto_now_add && (
            <Checkbox
              label="Auto now"
              onChange={(checked) => {
                updateRow({ auto_now: checked });
              }}
              checked={data.auto_now}
            />
          )}
        </>
      )}

      {data.type === ColumnType.PositiveIntegerField && (
        <Input
          type="number"
          label="Default"
          onChange={({ target: { value } }) => {
            updateRow({ default: value });
          }}
          value={data.default}
        />
      )}

      {data.type === ColumnType.FloatField && (
        <Input
          type="number"
          label="Default"
          onChange={({ target: { value } }) => {
            updateRow({ default: value });
          }}
          step={0.01}
          value={data.default}
        />
      )}

      {(data.type === ColumnType.TextField ||
        data.type === ColumnType.String) && (
        <>
          {data.type === ColumnType.String && (
            <Input
              label="Default"
              type="text"
              onChange={({ target: { value } }) => {
                updateRow({ default: value });
              }}
              value={data.default}
            />
          )}
          {data.type === ColumnType.TextField && (
            <TextArea
              label="Default"
              onChange={({ target: { value } }) => {
                updateRow({ default: value });
              }}
              rows={10}
              value={data.default}
            />
          )}
          {data.type === ColumnType.String && (
            <EnumSelector
              value={data.options_target}
              onChange={(options_target) => {
                updateRow({ options_target });
              }}
            />
          )}
          <Input
            type="number"
            label="Max Length"
            onChange={({ target: { value } }) => {
              const strippedValue =
                value === "" ? "" : parseInt(value, 10).toString();
              updateRow({ max_length: strippedValue });
            }}
            step={1}
            value={data.max_length || 0}
          />
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
          <Input
            label="Related Name"
            type="text"
            id="name"
            value={data?.related_name || ""}
            onChange={({ target: { value } }) => {
              updateRow({ related_name: value });
            }}
          />
        </>
      )}
      {data.type === ColumnType.ForeignKey && (
        <Select
          label="What should happen when deleted"
          value={{ label: data.on_delete, value: data.on_delete }}
          options={[
            { value: "", label: "Not selected" },
            ...Object.values(OnDeleteOptions).map((v) => {
              return { label: v, value: v };
            }),
          ]}
          renderer={(option) => (
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              {option.label}
            </div>
          )}
          onChange={({ value }) => {
            updateRow({ on_delete: value });
          }}
        />
      )}
    </div>
  );
};

export default ColumnEditor;
