type ProcessImageToggleProps = {
  noImageProcessing: boolean;
  setNoImageProcessing: (arg: any) => void;
};

const ProcessImageToggle = ({
  noImageProcessing,
  setNoImageProcessing,
}: ProcessImageToggleProps) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">DON'T POST-PROCESS IMAGE</p>
      <p className="text-xs text-base-content/80">
        If enabled, the image will not be converted or scaled or post-processed.
        This will output the original AI upscaling result as-is (Restart
        Required)
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={noImageProcessing}
        onClick={() => {
          setNoImageProcessing(!noImageProcessing);
          alert("Please restart Upscayl for the changes to take effect.");
        }}
      />
    </div>
  );
};

export default ProcessImageToggle;
