import { Link } from "react-router-dom";
import "./Tabs.css";

type Tab = { label: string; url: string };

export function Tabs({
  tabs,
  isSelected,
  onClick,
}: {
  tabs: Tab[];
  isSelected: (selectedLabel: string) => boolean;
  onClick: (option: Tab) => void;
}) {
  return (
    <div className="tabs">
      {tabs.map((option) => (
        <Link
          to={`${option.url}`}
          onClick={() => onClick(option)}
          className={` ${isSelected(option.label) ? "selected" : ""}`}
          key={option.label}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
