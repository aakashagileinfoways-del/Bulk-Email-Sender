type StatusBannerProps = {
  tone: "error" | "ok";
  message: string | null;
};

export const StatusBanner = ({ tone, message }: StatusBannerProps) => {
  if (!message) {
    return null;
  }
  return <div className={`banner ${tone}`}>{message}</div>;
};
