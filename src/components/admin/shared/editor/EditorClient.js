"use client";

import { forwardRef, useEffect, useState } from "react";
import EditorImpl from "@/components/admin/shared/editor/Editor";
import styles from "@/components/admin/shared/editor/Editor.module.css";
import proseStyles from "@/components/editor/editorProse.module.css";

const EditorClient = forwardRef(function EditorClient(props, ref) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${styles.wrapper} ${proseStyles.root}`}>
        <div className={styles.loading}>에디터를 로딩 중...</div>
      </div>
    );
  }

  return <EditorImpl ref={ref} {...props} />;
});

EditorClient.displayName = "EditorClient";

export default EditorClient;