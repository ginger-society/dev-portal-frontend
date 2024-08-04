export const ROUTES: any = {
  ["db.schemas"]: { url: "/" },
  ["service.specs"]: { url: "/services" },
  ["packages.metadata"]: { url: "/packages" },
};

export const sideMenuOptions = [
  { id: "db.schemas", label: <span>DB Schemas</span> },
  {
    id: "service.specs",
    label: <span>Service Specifications</span>,
  },
  {
    id: "packages.metadata",
    label: <span>Packages</span>,
  },
];
