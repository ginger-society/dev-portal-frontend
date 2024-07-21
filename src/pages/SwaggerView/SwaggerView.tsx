import BreadcrumContainer from "@/components/atoms/BreadcrumbContainer";
import { PageLayout } from "@/shared/PageLayout";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerViewPage = () => {
  return (
    <PageLayout>
      <BreadcrumContainer />
      <SwaggerUI url="https://petstore.swagger.io/v2/swagger.json" />
    </PageLayout>
  );
};

export default SwaggerViewPage;
