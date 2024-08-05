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
  PackageResponse,
  ServicesEnvTrimmedResponse,
  ServicesTrimmedResponse,
} from "@/services/MetadataService_client";
import router from "@/shared/router";
import BreadcrumContainer from "@/components/atoms/BreadcrumbContainer";
import { FaJs, FaPython, FaRust } from "react-icons/fa";

const PackagesListView = () => {
  const [searchTxt, setSearchTxt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PackageResponse[]>([]);
  const fetchData = async () => {
    const data = await MetadataService.metadataGetUserPackages();
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
                      <Text>
                        <strong>Description</strong> {service.description}
                      </Text>
                      <Text>
                        <strong>Type:</strong> {service.packageType}
                      </Text>
                      <Text size={TextSize.XLarge}>
                        {service.lang === "rust" && <FaRust />}
                        {service.lang === "typescript" && <FaJs />}
                        {service.lang === "python" && <FaPython />}
                      </Text>
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

export default PackagesListView;
