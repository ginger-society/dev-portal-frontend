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

  const openSwagger = (identifier: string, env: ServicesEnvTrimmedResponse) => {
    router.navigate(`/services/swagger/${identifier}/${env.envKey}`);
  };

  return (
    <PageLayout>
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
                    <Text size={TextSize.Large}>{service.identifier}</Text>
                    <div className="card-info-section">
                      <div>
                        <Text color={TextColor.Muted}>Environments</Text>
                        {service.envs.map((env) => {
                          return (
                            <li
                              onClick={() =>
                                openSwagger(service.identifier, env)
                              }
                            >
                              <div className="">
                                <Text>{env.envKey}</Text>(
                                <Text>
                                  Last updated :{env.updatedAt?.toDateString()}
                                </Text>
                                )
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
    </PageLayout>
  );
};

export default ServicesListView;
