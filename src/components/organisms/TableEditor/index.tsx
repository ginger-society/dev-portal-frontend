import { useUMLEditor } from "../UMLEditor/context";
import { BlockType, EditorProps } from "../UMLEditor/types";
import "@/shared/form-control.css";
import styles from "./table-editor.module.scss";
import { ChangeEventHandler } from "react";
import { slugGenerator } from "@/shared/utils";
import EnumEditor, { Option } from "@/components/atoms/EnumEditor";
import { ColumnType } from "../ColumnEditor/types";

const TableEditor = ({ close }: EditorProps) => {
  const {
    blocks,
    setBlocks,
    connections,
    setConnections,
    editorData = { blockId: "" },
  } = useUMLEditor();

  const updateBlock = (
    data: Record<string, any>,
    blockLevelData?: Record<string, any>,
  ) => {
    setBlocks((v) => {
      return {
        ...v,
        [editorData?.blockId]: {
          ...v[editorData?.blockId],
          data: { ...v[editorData?.blockId].data, ...data },
          ...blockLevelData,
        },
      };
    });
  };

  const handleNameChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (!editorData?.blockId) {
      return;
    }
    const slug = slugGenerator(value);
    updateBlock({ name: value, table_name: slug, id: slug }, { id: slug });
  };

  const handleDocChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editorData?.blockId) {
      return;
    }
    updateBlock({ docs: value });
  };

  const handleDelete = () => {
    setBlocks((v) => {
      delete v[editorData.blockId];
      return v;
    });
    close();
  };

  const block = blocks[editorData?.blockId];
  const data = block?.data;

  const handleEnumsChange = (value: Option[]) => {
    updateBlock({ options: value });
  };

  return (
    <>
      <div className={styles["header-container"]}>
        <h3>
          {block?.type === BlockType.Table ? "Table" : "Enum"} Editor :
          <strong>{data?.name}</strong>
        </h3>
        <button className="base-button secondary" onClick={handleDelete}>
          Delete
        </button>
      </div>
      {/* {JSON.stringify(blocks[editorData?.blockId]?.data)} */}
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
      <strong>
        {block?.type === BlockType.Table ? "Table" : "Enum"} name :{" "}
        {data?.table_name}
      </strong>
      <div className="form-group">
        <label>Doc String</label>
        <textarea
          id="name"
          className="base-input"
          placeholder="Enter name"
          value={data?.docs || ""}
          onChange={handleDocChange}
        />
      </div>

      {block?.type === BlockType.Enum && (
        <EnumEditor
          className={styles["enum-input"]}
          onChange={handleEnumsChange}
          value={data.options || []}
        />
      )}
    </>
  );
};

export default TableEditor;
