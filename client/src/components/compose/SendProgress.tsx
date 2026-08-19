type SendProgressProps = {
  done: number;
  total: number;
};

export const SendProgress = ({ done, total }: SendProgressProps) => {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="send-progress">
      <p className="send-progress-label">
        Sending {done} of {total} ({percent}%)
      </p>
      <div className="progress-bar light">
        <span className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};
