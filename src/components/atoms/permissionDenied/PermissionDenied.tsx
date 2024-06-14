import classes from "./PermissionDenied.module.scss";

const PermissionDenied: React.FC<object> = () => {
  return (
    <div className={classes.container}>
      <h1 className={classes.heading}>Permission denied</h1>
      <h2>You are not authorized to view this page</h2>
    </div>
  );
};

export default PermissionDenied;
