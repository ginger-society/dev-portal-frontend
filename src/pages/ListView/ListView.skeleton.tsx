import React from "react";
import { Skeleton } from "@ginger-society/ginger-ui";

const ListViewSkeleton = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        paddingTop: "20px",
      }}
    >
      <Skeleton width="100%" height="100px" borderRadius="8px" />
      <Skeleton width="100%" height="100px" borderRadius="8px" />
      <Skeleton width="100%" height="100px" borderRadius="8px" />
      <Skeleton width="100%" height="100px" borderRadius="8px" />
      <Skeleton width="100%" height="100px" borderRadius="8px" />
      <Skeleton width="100%" height="100px" borderRadius="8px" />
    </div>
  );
};

export default ListViewSkeleton;
