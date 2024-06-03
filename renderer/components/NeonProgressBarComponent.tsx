function NeonProgressBar({
 value
}: {
  value: number
}) {

  return (
    <div>
      <progress className='NeonProgressBar h-[0.4rem] w-96 appearance-none transition-width duration-200 ease-in-out' value={value} max='100'></progress>
      <style>{`
        .NeonProgressBar::-webkit-progress-bar {
          border-radius: 4px;
          background: #2E2E2E;
        }

        .NeonProgressBar::-webkit-progress-value {
          background: linear-gradient(to right, #1D94FA, #49D1F3);
          box-shadow: 0 0 10px rgba(29, 148, 250, 0.5), 0 0 20px rgba(73, 209, 243, 0.5), 0 0 30px rgba(29, 148, 250, 0.3), 0 0 40px rgba(73, 209, 243, 0.3);
          border-radius: 4px;
          transition: width 0.05s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NeonProgressBar;