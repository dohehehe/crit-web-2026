"use client";

import { useId, useState } from "react";

function collectChecked(items, path, map) {
  items.forEach((item, index) => {
    const key = [...path, index].join(".");
    map[key] = item.checked === true;

    if (item.items?.length) {
      collectChecked(item.items, [...path, index], map);
    }
  });

  return map;
}

function checklistSignature(items) {
  return JSON.stringify(items);
}

function ChecklistItems({ items, proseStyles, path, listId, checkedMap, onToggle }) {
  return (
    <ul className={`${proseStyles.list} ${proseStyles.checklist}`}>
      {items.map((item, index) => {
        const itemPath = [...path, index];
        const key = itemPath.join(".");
        const checked = checkedMap[key] === true;
        const labelId = item.html ? `${listId}-${key}` : undefined;

        return (
          <li key={key} className={proseStyles.checklistItem}>
            <button
              type="button"
              className={
                checked
                  ? `${proseStyles.checklistBox} ${proseStyles.checklistBoxChecked}`
                  : proseStyles.checklistBox
              }
              role="checkbox"
              aria-checked={checked}
              aria-labelledby={labelId}
              aria-label={labelId ? undefined : "항목 체크"}
              onClick={() => onToggle(key)}
            />
            {item.html ? (
              <span id={labelId} dangerouslySetInnerHTML={{ __html: item.html }} />
            ) : null}
            {item.items?.length ? (
              <ChecklistItems
                items={item.items}
                proseStyles={proseStyles}
                path={itemPath}
                listId={listId}
                checkedMap={checkedMap}
                onToggle={onToggle}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ChecklistList({ items, proseStyles }) {
  const sourceKey = checklistSignature(items);
  const [state, setState] = useState(() => ({
    sourceKey,
    checkedMap: collectChecked(items, [], {}),
  }));

  if (state.sourceKey !== sourceKey) {
    setState({
      sourceKey,
      checkedMap: collectChecked(items, [], {}),
    });
  }

  const listId = useId().replace(/:/g, "");

  if (!items?.length) {
    return null;
  }

  function onToggle(key) {
    setState((current) => ({
      ...current,
      checkedMap: {
        ...current.checkedMap,
        [key]: !current.checkedMap[key],
      },
    }));
  }

  return (
    <ChecklistItems
      items={items}
      proseStyles={proseStyles}
      path={[]}
      listId={listId}
      checkedMap={state.checkedMap}
      onToggle={onToggle}
    />
  );
}
