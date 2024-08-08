import { PageLayout } from "@/shared/PageLayout";
import {
  Button,
  ButtonType,
  Input,
  Pagination,
  Text,
  TextColor,
  TextSize,
  TextWeight,
} from "@ginger-society/ginger-ui";
import { useEffect, useState } from "react";
import ListViewSkeleton from "../ListView/ListView.skeleton";
import { MetadataService } from "@/services";
import {
  ServicesEnvTrimmedResponse,
  ServicesTrimmedResponse,
} from "@/services/MetadataService_client";
import router from "@/shared/router";
import BreadcrumContainer from "@/components/atoms/BreadcrumbContainer";
import { FaJs, FaPython, FaRust } from "react-icons/fa";

const ServicesListView = () => {
  const [searchTxt, setSearchTxt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ServicesTrimmedResponse[]>([]);
  const fetchData = async () => {
    const data = await MetadataService.metadataGetServicesAndEnvs();
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [pagination, setPagination] = useState<{
    offset: number;
    limit: number;
  }>({
    offset: 19,
    limit: 10,
  });

  const handlePaginationOnChange = (limit: number, offset: number) => {
    setPagination({ offset, limit });
  };

  const openSwagger = (
    org_id: string,
    identifier: string,
    env: ServicesEnvTrimmedResponse
  ) => {
    router.navigate(`/services/swagger/${org_id}/${identifier}/${env.envKey}`);
  };

  return (
    <PageLayout>
      <div className="padded-page">
        <BreadcrumContainer />

        <div className="schema-list">
          <div className="list-hedaer-actions-panel">
            <Input
              placeholder="Search..."
              onChange={({ target: { value } }) => {
                setSearchTxt(value);
              }}
              value={searchTxt}
              clearable
            />
          </div>

          {loading ? (
            <ListViewSkeleton />
          ) : (
            <ul className="schema-list-container">
              {data.map((service) => (
                <li
                  key={service.identifier}
                  className="schema-item-container"
                  onClick={() => {}}
                >
                  <>
                    <ul className="card schema-item ">
                      <div className="flex-column">
                        <Text size={TextSize.Large}>
                          @{service.organizationId}/{service.identifier}
                        </Text>
                        <Text> {service.serviceType}</Text>
                        <Text>
                          {" "}
                          <strong>Description</strong> {service.description}
                        </Text>
                        <Text size={TextSize.XLarge}>
                          {service.lang === "rust" && <FaRust />}
                          {service.lang === "typescript" && <FaJs />}
                          {service.lang === "python" && <FaPython />}
                        </Text>
                      </div>

                      <div className="card-info-section">
                        <Text color={TextColor.Muted}>Environments</Text>
                        <div style={{ display: "flex", gap: "20px" }}>
                          {service.envs.map((env) => {
                            return (
                              <li
                                onClick={() => {
                                  if (service.serviceType !== "Portal") {
                                    openSwagger(
                                      service.organizationId,
                                      service.identifier,
                                      env
                                    );
                                  }
                                }}
                              >
                                <div
                                  className=""
                                  style={{
                                    background:
                                      "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(193,110,110,1) 50%, rgba(252,176,69,1) 100%)",
                                    borderRadius: "20px",
                                    padding: "20px",
                                  }}
                                >
                                  <Text invertTheme weight={TextWeight.Bold}>
                                    {env.envKey}
                                  </Text>
                                  <br />
                                  <ul>
                                    <li>
                                      <Text invertTheme>
                                        <strong>Last updated</strong> :
                                        {env.updatedAt?.toDateString()}
                                      </Text>
                                    </li>
                                    <li>
                                      <Text invertTheme>
                                        <strong>Env Url :</strong>
                                        {env.baseUrl}
                                      </Text>
                                    </li>
                                    <li>
                                      <Text invertTheme>
                                        <strong>Version :</strong>
                                        {env.version}
                                      </Text>
                                    </li>
                                  </ul>
                                </div>
                              </li>
                            );
                          })}
                        </div>
                        <div>
                          <Text weight={TextWeight.Bold}>
                            Services depends on
                          </Text>
                          {service.dependencies.map((dependency) => {
                            return (
                              <li>
                                <Text>{dependency}</Text>
                              </li>
                            );
                          })}
                        </div>
                        <div>
                          {service.dbSchemaId && (
                            <Text>
                              <strong>DB Schema :</strong>{" "}
                              <Button
                                type={ButtonType.Tertiary}
                                onClick={() => {
                                  router.navigate(
                                    `/editor/${service.dbSchemaId}/main`
                                  );
                                }}
                                label={service.dbSchemaId}
                              ></Button>
                            </Text>
                          )}
                          <br />
                          {service.dbSchemaId && (
                            <Text>
                              <strong>DB Table depends on</strong>
                            </Text>
                          )}
                          {service.tables.map((table) => {
                            return (
                              <li>
                                <div className="">
                                  <Text>{table}</Text>
                                </div>
                              </li>
                            );
                          })}
                        </div>
                      </div>
                    </ul>
                  </>
                </li>
              ))}
            </ul>
          )}

          <Pagination
            totalRows={1100}
            initialRowsPerPage={pagination.limit}
            initialOffset={pagination.offset}
            onChange={handlePaginationOnChange}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default ServicesListView;
