"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminQuery } from "@/hooks/use-admin-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useImageUpload } from "@/hooks/useImageUpload";
import styles from "@/components/admin/shared/post-form.module.css";

const BANNER_SELECT = "id,img_url,link_url,is_active";

function emptyForm() {
  return {
    link_url: "",
    img_url: "",
    is_active: false,
  };
}

function bannerToForm(banner) {
  return {
    link_url: banner.link_url ?? "",
    img_url: banner.img_url ?? "",
    is_active: Boolean(banner.is_active),
  };
}

function BannerFormFields({ mode, bannerId, initialValues }) {
  const router = useRouter();
  const imageInputRef = useRef(null);
  const isEdit = mode === "edit";

  const { mutate: createBanner, isLoading: isCreating, error: createError } =
    useApiMutation("POST");
  const { mutate: updateBanner, isLoading: isUpdating, error: updateError } =
    useApiMutation("PATCH");
  const { mutate: deleteBanner, isLoading: isDeleting, error: deleteError } =
    useApiMutation("DELETE");
  const { uploadImageToServer } = useImageUpload();

  const [form, setForm] = useState(initialValues);
  const [imageError, setImageError] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError(null);
    setIsUploadingImage(true);

    try {
      const result = await uploadImageToServer(file);

      if (result.success && result.file?.url) {
        updateField("img_url", result.file.url);
        return;
      }

      setImageError(result.error ?? "이미지 업로드에 실패했습니다.");
    } catch (error) {
      setImageError(error.message ?? "이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      link_url: form.link_url.trim() || null,
      img_url: form.img_url.trim() || null,
      is_active: form.is_active,
    };

    try {
      if (isEdit) {
        await updateBanner(`banner/${bannerId}`, payload);
      } else {
        await createBanner("banner", payload);
      }

      router.push("/admin/notice");
    } catch {
      // mutation error state handles display
    }
  }

  async function handleDelete() {
    if (!isEdit || !bannerId) {
      return;
    }

    if (!window.confirm("이 배너를 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await deleteBanner(`banner/${bannerId}`);
      router.push("/admin/notice");
    } catch {
      // mutation error state handles display
    }
  }

  const isSaving = isCreating || isUpdating || isDeleting;
  const submitError = createError ?? updateError ?? deleteError;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} p-bold`}>기본 정보</h2>

        <label className={styles.field}>
          <span className="caption">연결 링크</span>
          <input
            className={styles.input}
            type="url"
            value={form.link_url}
            onChange={(event) => updateField("link_url", event.target.value)}
            placeholder="https://"
          />
        </label>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => updateField("is_active", event.target.checked)}
          />
          <span className="caption">활성 (공개)</span>
        </label>

        <div className={styles.field}>
          <span className="caption">배너 이미지</span>
          <span className="caption gray-65">광고 배너는 3:1 고정 비율을 유지하며, 화면 너비에 따라 가변적으로 확대·축소됩니다.</span>
          <input
            ref={imageInputRef}
            className={styles.hiddenFileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            className={`${styles.thumbnailButton} caption`}
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage || isSaving}
          >
            {isUploadingImage
              ? "업로드 중…"
              : form.img_url
                ? "이미지 변경"
                : "이미지 추가"}
          </button>
          {form.img_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.img_url}
              alt="배너 미리보기"
              className={styles.popupThumbnailPreview}
            />
          ) : null}
          {imageError && <p className={`${styles.error} caption`}>{imageError}</p>}
        </div>
      </div>

      {submitError && (
        <p className={`${styles.error} caption`}>
          {deleteError ? "삭제하지 못했습니다: " : "저장하지 못했습니다: "}
          {submitError.message}
        </p>
      )}

      <div className={styles.actions}>
        <div className={styles.primaryActions}>
          <button type="submit" className={`${styles.submitButton} caption`} disabled={isSaving}>
            {isSaving && !isDeleting ? "저장 중…" : isEdit ? "수정 저장" : "생성"}
          </button>
          <Link href="/admin/notice" className={`${styles.cancelButton} caption`}>
            취소
          </Link>
        </div>
        {isEdit && (
          <button
            type="button"
            className={`${styles.deleteButton} caption`}
            onClick={handleDelete}
            disabled={isSaving}
          >
            {isDeleting ? "삭제 중…" : "삭제"}
          </button>
        )}
      </div>
    </form>
  );
}

export function BannerForm({ mode, bannerId }) {
  const isEdit = mode === "edit";

  const {
    data: bannerData,
    isLoading: bannerLoading,
    error: bannerError,
  } = useAdminQuery(`banner/${bannerId}`, {
    params: { select: BANNER_SELECT },
    enabled: isEdit && Boolean(bannerId),
  });

  if (isEdit && bannerLoading) {
    return <p className={`${styles.status} caption gray-65`}>배너 불러오는 중…</p>;
  }

  if (isEdit && bannerError) {
    return (
      <p className={`${styles.error} caption`}>
        배너를 불러오지 못했습니다: {bannerError.message}
      </p>
    );
  }

  if (isEdit && !bannerData) {
    return null;
  }

  const initialValues = isEdit ? bannerToForm(bannerData) : emptyForm();
  const formKey = isEdit ? bannerId : "new";

  return (
    <BannerFormFields key={formKey} mode={mode} bannerId={bannerId} initialValues={initialValues} />
  );
}
