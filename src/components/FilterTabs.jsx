import { useLayoutEffect, useMemo, useRef, useState } from "react";

function FilterTabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) {
  const rootRef = useRef(null);
  const buttonRefs = useRef(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    x: 0,
    ready: false,
  });

  const rootClassName = useMemo(
    () => ["filter-tabs", className].filter(Boolean).join(" "),
    [className],
  );

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const container = rootRef.current;
      const activeButton = buttonRefs.current.get(activeTab);

      if (!container || !activeButton) {
        setIndicatorStyle((previousStyle) => ({
          ...previousStyle,
          ready: false,
        }));
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        width: buttonRect.width,
        x: buttonRect.left - containerRect.left,
        ready: true,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeTab, tabs]);

  const setButtonRef = (tabId) => (node) => {
    if (node) {
      buttonRefs.current.set(tabId, node);
      return;
    }

    buttonRefs.current.delete(tabId);
  };

  return (
    <div className={rootClassName} ref={rootRef}>
      <span
        aria-hidden="true"
        className={`filter-tabs__indicator${
          indicatorStyle.ready ? " is-ready" : ""
        }`}
        style={{
          width: `${indicatorStyle.width}px`,
          transform: `translateX(${indicatorStyle.x}px)`,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={setButtonRef(tab.id)}
          type="button"
          className={`filter-tabs__button${
            activeTab === tab.id ? " is-active" : ""
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
