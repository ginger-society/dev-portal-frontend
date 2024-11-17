import { MetadataService } from "@/services";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerViewPagePublic = () => {
  const { service_identifier, env_id, org_id } = useParams<{
    org_id: string;
    service_identifier: string;
    env_id: string;
  }>();

  const [spec, setSpec] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      if (service_identifier && env_id && org_id) {
        const data = await MetadataService.metadataGetServiceAndEnvByIdPublic({
          serviceIdentifier: service_identifier,
          env: env_id,
          orgId: org_id,
        });
        console.log(data);
        setSpec(JSON.parse(data.spec));
      }
    };
    fetchData();
  }, [service_identifier, env_id, org_id]);

  return (
    <>
      <SwaggerUI spec={spec} />
    </>
  );
};

export default SwaggerViewPagePublic;
