export function createEditorImageUploader(uploadImageToServer) {
  return {
    uploadByFile: async (file) => {
      try {
        const result = await uploadImageToServer(file);

        if (result?.success && result?.file?.url) {
          return {
            success: 1,
            file: {
              url: result.file.url,
              width: result.file.width,
              height: result.file.height,
            },
          };
        }

        return {
          success: 0,
          error: result?.error || "업로드 실패",
        };
      } catch (error) {
        console.error("Editor 이미지 업로드 에러:", error);
        return { success: 0, error: error.message };
      }
    },
  };
}
