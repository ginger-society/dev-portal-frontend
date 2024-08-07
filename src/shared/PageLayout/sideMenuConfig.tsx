export const ROUTES: any = {
  ["db.schemas"]: { url: "/" },
  ["service.specs"]: { url: "/services" },
  ["packages.metadata"]: { url: "/packages" },
  ["packages.sysDesign"]: { url: "/sys-design" },
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
  {
    id: "packages.sysDesign",
    label: <span>System Design</span>,
  },
];
