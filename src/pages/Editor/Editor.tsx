import HeaderContainer from "@/components/atoms/HeaderContainer";
import {
  LegendConfigs, UMLEditor, UMLEditorProvider,
  useUMLEditor, Block,
  Connection,
  BlockData,
  MarkerType,
  EditorData,
  BlockType,
  Row,
} from "@ginger-society/ginger-ui-uml";
import ColumnEditor from "@/components/organisms/ColumnEditor";
import { ColumnType } from "@/components/organisms/ColumnEditor/types";
import TableEditor from "@/components/organisms/TableEditor";

import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, ButtonType, Tooltip, AuthContext, Permission, PermissionType, PermissionContext, Text, TextSize, Aside, TextArea, useSnackbar, SnackbarTimer } from "@gingersociety/ginger-ui";
import styles from "./editor.module.scss";
import { FaDatabase, FaList, FaLock, FaTable } from "react-icons/fa";
import { GingerKubeService, MetadataService } from "@/services";
import { GetDbschemaByIdResponse } from "@/services/MetadataService_client";
import router from "@/shared/router";
// import AceEditor from "react-ace";


// Import a theme and a mode (required)
// import "ace-builds/src-noconflict/mode-python";
// import "ace-builds/src-noconflict/theme-solarized_dark";
// import "ace-builds/src-noconflict/theme-solarized_light";
// import "ace-builds/src-noconflict/mode-javascript";



const legendConfigs: LegendConfigs = {
  [MarkerType.Rectangle]: {
    label: "Many To Many",
    color: "#4793AF",
  },
  [MarkerType.Hexagon]: {
    label: "Foreign Key",
    color: "#89439f",
  },
  [MarkerType.Triangle]: {
    label: "One to One",
    color: "#799351",
  },
};

const Editor = () => {
  const [blocks, setBlocks] = useState<{ [key: string]: Block }>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editorData, setEditorData] = useState<EditorData>();
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false)
  const [logs, setLogs] = useState<string>()
  const [isLogLoading, setIsLogLoading] = useState<boolean>(false)
  const { show } = useSnackbar();
  const [commitMessage, setCommitMessage] = useState<string>();


  const { docId, branch } = useParams<{ docId: string; branch: string }>();
  const [branchData, setBranchData] = useState<GetDbschemaByIdResponse>();
  const { lookupPermission } = useContext(PermissionContext)
  const [allowEdit, setAllowEdit] = useState<boolean>(false)

  const updatePermission = async (groupId?: string) => {
    if (!groupId || !lookupPermission) {
      return;
    }
    const data = await lookupPermission(groupId, 'isMember')
    setAllowEdit(data)
  }

  const fetchData = async () => {
    if (!docId) {
      // Fetch document data with docId
      return;
    }

    const dbschema = await MetadataService.metadataGetDbschemaByIdUserland({
      schemaId: docId,
      branch,
    });

    setBranchData(dbschema);

    dbschema.groupId && updatePermission(dbschema.groupId)

    if (!dbschema.data) {
      return;
    }

    const mockBlocks2 = JSON.parse(dbschema.data) as BlockData[];

    const blockData: { [key: string]: Block } = Object.values(
      mockBlocks2
    ).reduce((accum, block) => {
      return {
        ...accum,
        [block.id]: {
          ...block,
          rows: block.rows || [],
          ref: React.createRef(),
          data: block.data || {},
          position: block.position || { top: 100, left: 200 },
          type: block.type || BlockType.Table,
        },
      };
    }, {});
    setBlocks(blockData);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const transformDataToSave = () => {
    return Object.values(blocks).map((block) => {
      return {
        id: block.id,
        position: block.position,
        rows: block.rows,
        data: block.data,
        type: block.type,
      };
    });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    const blocksStr = JSON.stringify(transformDataToSave());
    if (docId && branch && branchData?.id && branchData?.branchId) {
      await MetadataService.metadataUpdateDbschemaBranch({
        schemaId: docId,
        updateDbschemaBranchRequest: {
          branchName: branch,
          data: blocksStr,
        },
        branchId: branchData?.branchId,
      });

      setSaveLoading(false);
    }
  };


  const handleValidate = async () => {
    const blocksStr = JSON.stringify(transformDataToSave());
    handleSave();
    if (!branchData?.repoOrigin) {
      show("No repo found", SnackbarTimer.Medium)
      return;
    }

    const response = await GingerKubeService.routesTektonTaskrunCreate({
      kubectlRequest: {
        modelsPyContent: blocksStr,
        commit: false,
        repoName: branchData?.repoOrigin,
        dbName: branchData.name
      }
    })

    setIsSliderOpen(true);
    setLogs(undefined);

    console.log(response);
    setIsLogLoading(true);

    setTimeout(async () => {
      if (!response.taskrunName) {
        return;
      }

      const statusAndLogs = await GingerKubeService.routesTektonTaskrunLogs({
        logRequest: {
          taskrunName: response.taskrunName,
          stepName: "step-dry-run"
        }
      })

      console.log(statusAndLogs.status)
      console.log(statusAndLogs.logs)
      setIsSliderOpen(true)
      setLogs(statusAndLogs.logs)
      setIsLogLoading(false);


    }, 15000)

  }

  const handleMigrate = async () => {
    const blocksStr = JSON.stringify(transformDataToSave());

    if (!branchData?.repoOrigin) {
      return;
    }

    const response = await GingerKubeService.routesTektonTaskrunCreate({
      kubectlRequest: {
        modelsPyContent: blocksStr,
        commit: true,
        commitMessage,
        repoName: branchData?.repoOrigin,
        dbName: branchData.name
      }
    })

    setIsSliderOpen(false);
    setCommitMessage(undefined);
    setLogs(undefined);
    show(<>Migration started.. Esitated time 3 minutes</>, SnackbarTimer.Medium)

  }

  const onCodeEditorDataChange = (newValue: string) => {
    console.log(newValue);
  }

  return (
    <UMLEditorProvider
      value={{
        blocks,
        setBlocks,
        connections,
        setConnections,
        editorData,
        setEditorData,
      }}
    >
      <>
        <HeaderContainer>
          <div className={styles["actions-container"]}>
            <FaDatabase /> {branchData?.orgId}/ {branchData?.name}
            <Permission type={PermissionType.MEMBER} groupId={branchData?.groupId}>
              <>
                <Button
                  onClick={handleSave}
                  label={saveLoading ? "Saving..." : "Save"}
                  loading={saveLoading}
                  type={ButtonType.Primary}
                ></Button>
                <Button
                  onClick={handleValidate}
                  label={"Make Migrations"}
                  type={ButtonType.Primary}
                ></Button>
              </>
            </Permission>
          </div>
        </HeaderContainer>
        <UMLEditorWrapper allowEdit={allowEdit} />
        <Aside
          isOpen={isSliderOpen}
          onClose={() => setIsSliderOpen(false)}
        >
          <div style={{ height: '100vh', overflow: 'auto' }}>
            <div style={{ display: 'flex' }}>
              <Text tag="h1" size={TextSize.Large}>
                Logs
              </Text>
            </div>
            <Text>
              {isLogLoading ? 'Loading......' : ''}
              <pre style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: "0.875rem", // optional: make it a bit smaller
                overflowY: "auto",
                background: "var(--primary-bg-color)", // optional: light background
                padding: "1rem",
                borderRadius: "0.5rem"
              }}>{logs}</pre>
            </Text>
            <div>
              {!isLogLoading ? <>
                {/* <Text>Pre Migration Script</Text>
                <AceEditor
                  mode="python"
                  theme="solarized_dark"
                  onChange={onCodeEditorDataChange}
                  name="pre_migration_script"
                  editorProps={{ $blockScrolling: true }}
                  width="100%"
                />
                <Text>Post Migration Script</Text>
                <AceEditor
                  mode="python"
                  theme="solarized_dark"
                  onChange={onCodeEditorDataChange}
                  name="post_migration_script"
                  editorProps={{ $blockScrolling: true }}
                  width="100%"
                /> */}
                <TextArea label="Commit Message" value={commitMessage} onChange={({ target: { value } }) => setCommitMessage(value)} />
                <Button onClick={handleMigrate} type={ButtonType.Primary} fullWidth label="Migrate"></Button>
              </> : <></>}
            </div>
          </div>
        </Aside>
      </>
    </UMLEditorProvider >

  );
};

const UMLEditorWrapper = ({ allowEdit }: { allowEdit: boolean }) => {
  const { blocks, setBlocks, connections, setConnections, setEditorData } =
    useUMLEditor();

  const updateConnections = () => {
    const connections: Connection[] = [];
    Object.keys(blocks).forEach((key) => {
      const block = blocks[key];
      block.rows.forEach((row, index) => {
        if (row.data.type === ColumnType.ForeignKey) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Hexagon,
            label: `column : ${row.data.field_name}_id`,
          });
        } else if (row.data.type === ColumnType.ManyToManyField) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Rectangle,
            label: `Via table ${block.id}_${row.data.field_name}`,
          });
        } else if (row.data.type === ColumnType.OneToOneField) {
          const block1Id = row.data.target;
          const block2Id = block.id;
          const toRow = index;
          const fromRow = 0;

          connections.push({
            block1Id,
            block2Id,
            fromRow,
            toRow,
            marker: MarkerType.Triangle,
            label: `Uniquly via ${row.data.field_name}_id`,
          });
        }
      });
    });
    setConnections(connections);
  };

  useEffect(() => {
    updateConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const createNewBlock = (
    type: BlockType,
    x: number,
    y: number,
    id: string
  ): Block => {
    const rows: Row[] = [];
    if (type === BlockType.Table) {
      rows.push({
        id: "pk",
        data: {
          type: "BigAutoField",
          name: "pk",
          field_name: "pk",
        },
      });
    }
    const newBlock = {
      id,
      rows: [...rows],
      ref: React.createRef<HTMLDivElement>(),
      position: { top: y, left: x },
      data: {},
      type: type,
    };
    return newBlock;
  };

  return (
    <UMLEditor
      setBlocks={setBlocks}
      setConnections={setConnections}
      blocks={blocks}
      RowRenderer={({ rowData }) => {
        let hasError = false;
        if (
          (rowData.data.type === ColumnType.ForeignKey ||
            rowData.data.type === ColumnType.ManyToManyField ||
            rowData.data.type === ColumnType.OneToOneField) &&
          !blocks[rowData.data.target]
        ) {
          hasError = true;
        }

        return (
          <div
            className="column-repr"
            onClick={(e) => {
              if (rowData.data.type === ColumnType.PK) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
          >
            <strong
              className={hasError || !rowData.data.type ? "text-error" : ""}
            >
              {rowData.data.field_name}
            </strong>
            {rowData.data.type === ColumnType.PK && (
              <Tooltip label={<FaLock />} position="bottom">
                Locked field
              </Tooltip>
            )}

            {rowData.data.null && (
              <Tooltip label={"?"} position="left">
                Optional Field
              </Tooltip>
            )}
            <small>{rowData.data.type || ""}</small>
            {!rowData.data.field_name && !rowData.data.type && (
              <span className="text-danger">New Row - Click to define</span>
            )}
          </div>
        );
      }}
      HeadingRenderer={({ blockData }) => (
        <>
          {blockData.type === BlockType.Table && (
            <span className="heading-txt">
              <FaTable />
              {(blockData.data.name || "") + " : Table"}
            </span>
          )}
          {blockData.type === BlockType.Enum && (
            <>
              <FaList />
              {(blockData.data.name || "") + " : Enums"}
            </>
          )}
        </>
      )}
      EnumRowRenderer={({ blockData }) => {
        const usedIn: string[] = [];
        Object.values(blocks).forEach((block) => {
          block.rows.forEach((row) => {
            if (
              row.data.type === ColumnType.String &&
              row.data.options_target === blockData.id
            ) {
              usedIn.push(block.id);
            }
          });
        });

        return (
          <div className="enum-row-renderer-container">
            <span>
              Total of {(blockData.data.options || []).length} Choices
            </span>
            <span>
              Used in{" "}
              {usedIn.map((u, index) => {
                return (
                  <>
                    <strong>{u}</strong>
                    {index < usedIn.length - 1 && ", "}
                  </>
                );
              })}
            </span>
          </div>
        );
      }}
      connections={connections}
      legendConfigs={legendConfigs}
      RowEditor={ColumnEditor}
      BlockEditor={TableEditor}
      setEditorData={setEditorData}
      updateConnections={updateConnections}
      createNewBlock={createNewBlock}
      allowEdit={allowEdit}
    />
  );
};

export default Editor;
