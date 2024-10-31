import { Block, BlockType } from "@/components/organisms/UMLEditor/types";
import { GetDbschemaAndTablesResponse, PackageResponse, ServicesTrimmedResponse } from "@/services/MetadataService_client";
import React from "react";
import { blockColorMap, IconsMap, shadowClassMap } from "./SysDesignView";
import { IconType } from "react-icons";
import { FaDatabase } from "react-icons/fa";
import { TextColor } from "@ginger-society/ginger-ui";

export const processAndBuildBlocks = (services: ServicesTrimmedResponse[], packages: PackageResponse[], dbSchemas: GetDbschemaAndTablesResponse[], env: string): {
  blocks: {
    [key: string]: Block;
  }, statusTxt: string, statusColor: TextColor
} => {
  const blocks: { [key: string]: Block } = {};

  packages.forEach((pkg) => {
    const rows = [];
    if (pkg.dependencies.length > 0) {
      rows.push({
        id: `${pkg.identifier}-dependencies`,
        data: { heading: "Dependns on", list: pkg.dependencies },
      });
    }

    blocks[pkg.identifier] = {
      id: pkg.identifier,
      position: { top: 100, left: 100 },
      type: BlockType.SystemBlock,
      ref: React.createRef(),
      data: {
        name: pkg.identifier,
        description: pkg.description,
        type: pkg.packageType,
        dependencies: pkg.dependencies,
        version: pkg.version,
        blinkClass: pkg.pipelineStatus && shadowClassMap[pkg.pipelineStatus],
        color:
          pkg.pipelineStatus === "failed"
            ? "red"
            : pkg.packageType != "library"
              ? "#4793AF"
              : null,
        pipeline_status: pkg.pipelineStatus,
        repo_origin: pkg.repoOrigin,
        projectOptions: pkg.quickLinks
          ? JSON.parse(pkg.quickLinks).map((link: any) => {
            return {
              ...link,
              Icon: IconsMap[link.icon as keyof IconType],
            };
          })
          : null,
      },
      rows,
    };
  });



  dbSchemas.forEach((schema) => {
    if (schema.identifier) {
      if (schema.dbType === "rdbms") {
        blocks[schema.identifier] = {
          id: schema.identifier,
          ref: React.createRef(),
          data: {
            name: schema.name,
            type: "database",
            description: schema.description,
            blinkClass:
              schema.pipelineStatus && shadowClassMap[schema.pipelineStatus],
            color: blockColorMap.database,
            version: schema.version,
            pipeline_status: schema.pipelineStatus,
            repo_origin: schema.repoOrigin,
            projectOptions: schema.quickLinks
              ? JSON.parse(schema.quickLinks).map((link: any) => {
                return {
                  ...link,
                  Icon: IconsMap[link.icon as keyof IconType],
                };
              })
              : null,
          },
          rows: [
            {
              id: `${schema.identifier}-tables`,
              data: { heading: "Tables", list: schema.tables },
            },
          ],
          type: BlockType.SystemBlock,
          position: { top: 100, left: 100 },
        };
      } else if (schema.dbType === "cache") {
        blocks[schema.identifier] = {
          id: schema.identifier,
          ref: React.createRef(),
          data: {
            name: schema.name,
            type: "cache",
            description: schema.description,

            blinkClass:
              schema.pipelineStatus && shadowClassMap[schema.pipelineStatus],

            color: blockColorMap.Cache,
            version: schema.version,
            pipeline_status: schema.pipelineStatus,
            repo_origin: schema.repoOrigin,
            projectOptions: schema.quickLinks
              ? JSON.parse(schema.quickLinks).map((link: any) => {
                return {
                  ...link,
                  Icon: IconsMap[link.icon as keyof IconType],
                };
              })
              : null,
          },
          rows: [],
          type: BlockType.SystemBlock,
          position: { top: 100, left: 100 },
        };
      } else {
        blocks[schema.identifier] = {
          id: schema.identifier,
          ref: React.createRef(),
          data: {
            name: schema.name,
            type: "messagequeue",
            description: schema.description,
            blinkClass:
              schema.pipelineStatus && shadowClassMap[schema.pipelineStatus],

            color: blockColorMap.MessageQueue,
            version: schema.version,
            pipeline_status: schema.pipelineStatus,
            repo_origin: schema.repoOrigin,
            projectOptions: schema.quickLinks
              ? JSON.parse(schema.quickLinks).map((link: any) => {
                return {
                  ...link,
                  Icon: IconsMap[link.icon as keyof IconType],
                };
              })
              : null,
          },
          rows: [],
          type: BlockType.SystemBlock,
          position: { top: 100, left: 100 },
        };
      }
    }
  });


  services.forEach((service) => {
    const rows = [];
    if (service.dependencies.length > 0) {
      rows.push({
        id: `${service.identifier}-dependencies`,
        data: {
          heading: "Depends on",
          list: service.dependencies,
        },
      });
    }

    if (service.tables.length > 0) {
      rows.push({
        id: `${service.dbSchemaId}-tables`,
        data: {
          heading: (
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <FaDatabase /> Database
            </div>
          ),
          list: service.tables,
          description: (
            <>
              From
              <strong>
                {
                  dbSchemas.find(
                    (schema) => schema.identifier === service.dbSchemaId
                  )?.name
                }
              </strong>
              uses the following tables
            </>
          ),
        },
      });
    }

    if (service.cacheSchemaId) {
      rows.push({
        id: `${service.cacheSchemaId}`,
        data: {
          heading: (
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <FaDatabase /> Cache
            </div>
          ),
          list: [],
          description: (
            <div style={{ display: "flex", gap: "5px" }}>
              Uses
              <strong>
                {
                  dbSchemas.find(
                    (schema) => schema.identifier === service.cacheSchemaId
                  )?.name
                }
              </strong>
              as Cache
            </div>
          ),
        },
      });
    }
    if (service.messageQueueSchemaId) {
      rows.push({
        id: `${service.messageQueueSchemaId}`,
        data: {
          heading: (
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <FaDatabase /> Message Queue
            </div>
          ),
          list: [],
          description: (
            <div style={{ display: "flex", gap: "5px" }}>
              Uses
              <strong>
                {
                  dbSchemas.find(
                    (schema) =>
                      schema.identifier === service.messageQueueSchemaId
                  )?.name
                }
              </strong>
              as Message Queue
            </div>
          ),
        },
      });
    }

    const pipeline_status = service.envs.find(
      (s) => s.envKey === env
    )?.pipelineStatus;

    blocks[service.identifier] = {
      id: service.identifier,
      ref: React.createRef(),
      data: {
        name: service.identifier,
        type: service.serviceType,
        description: service.description,
        dependencies: service.dependencies,
        dbSchemaId: service.dbSchemaId,
        cacheSchemaId: service.cacheSchemaId,
        messageQueueSchemaId: service.messageQueueSchemaId,
        org_id: service.organizationId,
        repo_origin: service.repoOrigin,
        blinkClass: pipeline_status && shadowClassMap[pipeline_status],
        color:
          pipeline_status === "failed"
            ? "red"
            : service.serviceType &&
            (blockColorMap as any)[service.serviceType],
        version: service.envs.find((s) => s.envKey === env)?.version,
        pipeline_status,
        projectOptions: service.quickLinks
          ? JSON.parse(service.quickLinks).map((link: any) => {
            return {
              ...link,
              Icon: IconsMap[link.icon as keyof IconType],
            };
          })
          : null,
      },
      rows: rows,
      type: BlockType.SystemBlock,
      position: { top: 100, left: 100 },
    };
  });

  const statuses = Object.keys(blocks).reduce(
    (allStatuses: string[], key) => {
      return [...allStatuses, blocks[key].data.pipeline_status];
    },
    []
  );
  let statusTxt;
  let statusColor;
  if (statuses.includes("failed")) {
    statusTxt = "failed";
    statusColor = TextColor.Danger;
  } else if (statuses.includes("running")) {
    statusTxt = "running...";
    statusColor = TextColor.Warning;
  } else if (statuses.includes("waiting")) {
    statusTxt = "Waiting...";
    statusColor = TextColor.Warning;
  } else {
    statusTxt = "Passing";
    statusColor = TextColor.Success;
  }
  return { blocks, statusTxt, statusColor };
}
