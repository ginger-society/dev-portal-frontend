import { Breadcrumb } from "@ginger-society/ginger-ui";

const paths = [
  { path: "home", label: "Home" },
  { path: "home/accounts", label: "Accounts" },
  { path: "home/accounts/receivables", label: "Receivables" },
];

const handleBreadcrumbClick = (path: string) => {
  console.log("Breadcrumb clicked:", path);
  // Implement navigation or any other logic here
};

const BreadcrumContainer = () => (
  <Breadcrumb value={paths} onClick={handleBreadcrumbClick} />
);

export default BreadcrumContainer;
