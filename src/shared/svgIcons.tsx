export const triangleIcon = (color: string) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={color}
    >
      <path d="M12 2L22 21H2L12 2Z" />
    </svg>
  );
};

export const rectangleIcon = (color: string) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={color}
    >
      <rect x="0" y="0" width="24" height="24" />
    </svg>
  );
};
export const circleIcon = (color: string) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill={color}
    >
      <circle cx="12" cy="12" r="12" />
    </svg>
  );
};

export const hexagonIcon = (color: string) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-6 -6 12 12"
      width="24"
      height="24"
      fill={color}
    >
      <polygon points="-6 -3 0 -6 6 -3 6 3 0 6 -6 3" />
    </svg>
  );
};
