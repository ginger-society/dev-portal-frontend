interface IProps {
  title: string;
}

const Child = (props: IProps) => {
  return <span>{props.title}</span>;
};

export default Child;
