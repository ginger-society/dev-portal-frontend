import { PageLayout } from "@/shared/PageLayout";
import { Button, Input, Pagination } from "@ginger-society/ginger-ui";
import { useState } from "react";
import ListViewSkeleton from "../ListView/ListView.skeleton";

const ServicesListView = () => {
  const [searchTxt, setSearchTxt] = useState<string>("");
  const [loading, setLoading] = useState(true);

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
            {[1, 2, 3].map((doc) => (
              <li key={doc} className="card schema-item" onClick={() => {}}>
                <></>
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
