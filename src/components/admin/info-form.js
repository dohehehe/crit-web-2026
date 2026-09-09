"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { AdminCategoryTabs } from "./admin-category-tabs";
import styles from "./info-form.module.css";

const INFO_SELECT =
  "id,email,insta,youtube,info_text,subscription_text,submission_text";

const CONTACT_FIELDS = [
  { id: "email", label: "Email", type: "email" },
  { id: "insta", label: "Instagram", type: "text", placeholder: "URL 또는 @username" },
  { id: "youtube", label: "YouTube", type: "text", placeholder: "채널 URL" },
];

const INFO_GROUPS = [
  { id: "contact", name: "연락처", fields: CONTACT_FIELDS },
  {
    id: "info",
    name: "소개",
    fields: [{ id: "info_text", label: "소개", multiline: true }],
  },
  {
    id: "subscription",
    name: "구독",
    fields: [{ id: "subscription_text", label: "구독", multiline: true }],
  },
  {
    id: "submission",
    name: "투고",
    fields: [{ id: "submission_text", label: "투고", multiline: true }],
  },
];

function toDisplayValue(value) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function InfoFieldEditor({ fieldConfig, initialValue, infoId, onInfoCreated }) {
  const [value, setValue] = useState(initialValue);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const { mutate: createInfo, isLoading: isCreating } = useApiMutation("POST");
  const { mutate: updateInfo, isLoading: isUpdating } = useApiMutation("PATCH");

  useEffect(() => {
    setValue(initialValue);
    setSaveError(null);
    setSaved(false);
  }, [fieldConfig.id, initialValue]);

  async function handleSave() {
    setSaveError(null);
    setSaved(false);

    const payload = { [fieldConfig.id]: value.trim() || null };

    try {
      if (infoId) {
        await updateInfo(`info/${infoId}`, payload);
      } else {
        const created = await createInfo("info", payload);
        onInfoCreated(created.id);
      }

      setSaved(true);
    } catch (error) {
      setSaveError(error.message ?? "저장하지 못했습니다.");
    }
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className={styles.editor}>
      <label className={styles.field}>
        <span className="caption">{fieldConfig.label}</span>
        {fieldConfig.multiline ? (
          <textarea
            className={styles.textarea}
            value={value}
            rows={10}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
            }}
          />
        ) : (
          <input
            className={styles.input}
            type={fieldConfig.type ?? "text"}
            value={value}
            placeholder={fieldConfig.placeholder}
            onChange={(event) => {
              setValue(event.target.value);
              setSaved(false);
            }}
          />
        )}
      </label>
      <div className={styles.fieldFooter}>
        <button
          type="button"
          className={`${styles.saveButton} caption`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "저장 중…" : "저장"}
        </button>
        {saved && <span className={`${styles.savedHint} caption gray-65`}>저장됨</span>}
        {saveError && <span className={`${styles.error} caption`}>{saveError}</span>}
      </div>
    </div>
  );
}

export function InfoForm() {
  const [infoId, setInfoId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const {
    data: infoListData,
    isLoading,
    error,
    refetch,
  } = useAdminQuery("info", {
    params: {
      select: INFO_SELECT,
      order: "created_at.asc",
      limit: 1,
    },
  });

  const info = infoListData?.items?.[0] ?? null;
  const selectedGroup = useMemo(
    () => INFO_GROUPS.find((group) => group.id === selectedGroupId) ?? null,
    [selectedGroupId]
  );

  useEffect(() => {
    setInfoId(info?.id ?? null);
  }, [info?.id]);

  function handleInfoCreated(id) {
    setInfoId(id);
    refetch();
  }

  if (isLoading) {
    return <p className={`${styles.status} caption gray-65`}>정보 불러오는 중…</p>;
  }

  if (error) {
    return (
      <p className={`${styles.error} caption`}>
        정보를 불러오지 못했습니다: {error.message}
      </p>
    );
  }

  return (
    <div className={styles.form}>
      <AdminCategoryTabs
        categories={INFO_GROUPS}
        selectedId={selectedGroupId}
        onSelect={setSelectedGroupId}
        showAllTab={false}
        ariaLabel="정보 항목"
      />

      <div className={styles.editorPanel} role="tabpanel">
        {!selectedGroup ? (
          <p className={`${styles.status} caption gray-65`}>
            항목을 선택하면 편집할 수 있습니다.
          </p>
        ) : (
          <div className={styles.editorStack}>
            {selectedGroup.fields.map((field) => (
              <InfoFieldEditor
                key={field.id}
                fieldConfig={field}
                initialValue={toDisplayValue(info?.[field.id])}
                infoId={infoId}
                onInfoCreated={handleInfoCreated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
