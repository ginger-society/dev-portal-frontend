import { useUMLEditor } from "../UMLEditor/context";
import { BlockType, EditorProps } from "../UMLEditor/types";
import styles from "./table-editor.module.scss";
import { ChangeEventHandler } from "react";
import { slugGenerator } from "@/shared/utils";
import EnumEditor, { Option } from "@/components/atoms/EnumEditor";
import { ColumnType } from "../ColumnEditor/types";
import {
  Button,
  ButtonType,
  Input,
  Text,
  TextArea,
  TextColor,
  TextWeight,
} from "@ginger-society/ginger-ui";

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
    blockLevelData?: Record<string, any>
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
    <div className={styles["container"]}>
      <div className={styles["header-container"]}>
        <Text>
          {block?.type === BlockType.Table ? "Table" : "Enum"} Editor :
          <strong>{data?.name}</strong>
        </Text>
        <Button
          onClick={handleDelete}
          type={ButtonType.Tertiary}
          label={<Text color={TextColor.Danger}>Delete</Text>}
          confirmConfig={{
            title: "Are you sure ?",
            description: "This is not reversible",
            confirmButtonLabel: "Yes, I am sure",
            okBtnType: ButtonType.Danger,
          }}
        ></Button>
      </div>
      {/* {JSON.stringify(blocks[editorData?.blockId]?.data)} */}
      <Input
        type="text"
        id="name"
        label="Name"
        placeholder="Enter name"
        value={data?.name || ""}
        onChange={handleNameChange}
      />
      <Text weight={TextWeight.Bold}>
        {block?.type === BlockType.Table ? "Table" : "Enum"} name :{" "}
        {data?.table_name}
      </Text>
      <TextArea
        id="name"
        label="Doc String"
        placeholder="Enter name"
        value={data?.docs || ""}
        onChange={handleDocChange}
      />

      {block?.type === BlockType.Enum && (
        <EnumEditor
          className={styles["enum-input"]}
          onChange={handleEnumsChange}
          value={data.options || []}
        />
      )}
    </div>
  );
};

export default TableEditor;
