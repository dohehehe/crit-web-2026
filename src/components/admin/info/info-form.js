"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { normalizeBlocks } from "@/lib/editorjs/normalizeBlocks";
import EditorClient from "@/components/admin/shared/editor/EditorClient";
import { AdminCategoryTabs } from "@/components/admin/shared/admin-category-tabs";
import styles from "@/components/admin/info/info-form.module.css";

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
    fields: [{ id: "info_text", label: "소개", editor: true }],
  },
  {
    id: "subscription",
    name: "구독",
    fields: [{ id: "subscription_text", label: "구독", editor: true }],
  },
  {
    id: "submission",
    name: "투고",
    fields: [{ id: "submission_text", label: "투고", editor: true }],
  },
];

function parseContent(content) {
  let value = content;

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    try {
      value = JSON.parse(trimmed);
    } catch {
      value = { body: trimmed };
    }
  }

  const blocks = normalizeBlocks(value);

  if (blocks.length === 0) {
    return null;
  }

  return { blocks };
}

function serializeEditorContent(savedData) {
  const blocks = normalizeBlocks(savedData);

  if (blocks.length === 0) {
    return null;
  }

  return { blocks };
}

function toContactInitialValue(value) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function InfoContactFieldEditor({
  fieldConfig,
  initialValue,
  infoId,
  onInfoCreated,
  onSaved,
}) {
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
      await onSaved?.();
    } catch (error) {
      setSaveError(error.message ?? "저장하지 못했습니다.");
    }
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className={styles.editor}>
      <label className={styles.field}>
        <span className="caption">{fieldConfig.label}</span>
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

function InfoEditorFieldEditor({
  fieldConfig,
  initialContent,
  infoId,
  onInfoCreated,
  onSaved,
}) {
  const editorRef = useRef(null);
  const [saveError, setSaveError] = useState(null);
  const [editorError, setEditorError] = useState(null);
  const [saved, setSaved] = useState(false);

  const { mutate: createInfo, isLoading: isCreating } = useApiMutation("POST");
  const { mutate: updateInfo, isLoading: isUpdating } = useApiMutation("PATCH");

  useEffect(() => {
    setSaveError(null);
    setEditorError(null);
    setSaved(false);
  }, [fieldConfig.id, initialContent]);

  async function handleSave() {
    setSaveError(null);
    setEditorError(null);
    setSaved(false);

    let fieldValue = null;

    try {
      if (!editorRef.current?.isReady?.()) {
        throw new Error("에디터가 아직 준비되지 않았습니다.");
      }

      const savedData = await editorRef.current.save();
      fieldValue = serializeEditorContent(savedData);
    } catch (error) {
      setEditorError(error.message ?? "에디터 내용을 저장하지 못했습니다.");
      return;
    }

    const payload = { [fieldConfig.id]: fieldValue };

    try {
      if (infoId) {
        await updateInfo(`info/${infoId}`, payload);
      } else {
        const created = await createInfo("info", payload);
        onInfoCreated(created.id);
      }

      setSaved(true);
      await onSaved?.();
    } catch (error) {
      setSaveError(error.message ?? "저장하지 못했습니다.");
    }
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className={styles.editor}>
      <div className={styles.field}>
        <span className="caption">{fieldConfig.label}</span>
        <EditorClient ref={editorRef} data={initialContent} />
        {editorError && <span className={`${styles.error} caption`}>{editorError}</span>}
      </div>
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
  const [editorRefreshKey, setEditorRefreshKey] = useState(0);

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

  async function handleFieldSaved() {
    await refetch();
    setEditorRefreshKey((key) => key + 1);
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
            {selectedGroup.fields.map((field) =>
              field.editor ? (
                <InfoEditorFieldEditor
                  key={`${field.id}-${infoId ?? "new"}-${editorRefreshKey}`}
                  fieldConfig={field}
                  initialContent={parseContent(info?.[field.id])}
                  infoId={infoId}
                  onInfoCreated={handleInfoCreated}
                  onSaved={handleFieldSaved}
                />
              ) : (
                <InfoContactFieldEditor
                  key={field.id}
                  fieldConfig={field}
                  initialValue={toContactInitialValue(info?.[field.id])}
                  infoId={infoId}
                  onInfoCreated={handleInfoCreated}
                  onSaved={handleFieldSaved}
                />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
