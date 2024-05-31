const AsideWindow = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <>
      <dialog
        id="sliderDialog"
        className={`${isOpen ? "open" : ""}`}
        open={isOpen}
      >
        {children}
      </dialog>
      {isOpen && <div id="overlay" onClick={onClose}></div>}
    </>
  );
};

export default AsideWindow;
