const DataBaseBlock = ({ data }: { data: any }) => (
  <div
    style={{
      padding: 10,
      borderRadius: 5,
      backgroundColor: data.background || "white",
      color: data.color || "black",
    }}
  >
    DB{data.label}
  </div>
);

export default DataBaseBlock;
