import { XIcon } from "../Icons/XIcon.tsx";
import "./ErrorBanner.css";

export function ErrorBanner({
  error,
  handleCloseBanner,
  hasMargin = false,
}: {
  error: string;
  handleCloseBanner: () => void;
  hasMargin: boolean;
}) {
  return (
    <div className={`error-banner ${hasMargin ? "has-margin" : ""}`}>
      <div className="content">
        <p className="tiny-text error-text bold">Error:</p>
        <p className="error small-text " title={error}>
          {error}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleCloseBanner();
        }}
      >
        <XIcon />
      </button>
    </div>
  );
}
