import BreadcrumContainer from "@/components/atoms/BreadcrumbContainer";
import { MetadataService } from "@/services";
import { PageLayout } from "@/shared/PageLayout";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerViewPage = () => {
  const { service_identifier, env_id } = useParams<{
    service_identifier: string;
    env_id: string;
  }>();

  const [spec, setSpec] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      if (service_identifier && env_id) {
        const data = await MetadataService.metadataGetServiceAndEnvById({
          serviceIdentifier: service_identifier,
          env: env_id,
        });
        console.log(data);
        setSpec({
          ...JSON.parse(data.spec),
          servers: [
            {
              url: data.baseUrl,
              description: env_id,
            },
          ],
        });
      }
    };
    fetchData();
  }, [service_identifier, env_id]);

  const token = useMemo(() => {
    return localStorage.getItem("access_token");
  }, []); // Retrieve the token from localStorage

  return (
    <PageLayout>
      <BreadcrumContainer />
      <div style={{ background: "white" }}>
        <SwaggerUI
          spec={spec}
          requestInterceptor={(req) => {
            if (token) {
              req.headers["Authorization"] = token;
            }
            return req;
          }}
        />
      </div>
    </PageLayout>
  );
};

export default SwaggerViewPage;
