function FilterTabs({ tabs, activeTab, onTabChange, className = "filter-tabs" }) {
  return (
    <div className={className}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`${className}__button${
            activeTab === tab.id ? ` ${className}__button--active` : ""
          }`}
          aria-pressed={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
