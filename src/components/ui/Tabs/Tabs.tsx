import "./Tabs.css";

type Tab = { label: string };

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
        <button
          onClick={() => onClick(option)}
          className={` ${isSelected(option.label) ? "selected" : ""}`}
          key={option.label}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
