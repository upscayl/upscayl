const MacTitlebarDragRegion = () => {
  return window.electron.platform === "mac" ? (
    <div className="mac-titlebar absolute top-0 h-8 w-full"></div>
  ) : null;
};

export default MacTitlebarDragRegion;
