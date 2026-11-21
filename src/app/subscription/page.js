import { SubscriptionForm } from "@/components/auth/SubscriptionForm";
import { EditorContent } from "@/components/editor/EditorContent";
import { getSubscriptionText } from "@/lib/info/getSiteInfo";
import subscriptionProseStyles from "./subscriptionEditorProse.module.css";

export const metadata = {
  title: "회원가입",
};

export default async function SubscriptionPage() {
  const subscriptionText = await getSubscriptionText();

  return (
    <main>
      <SubscriptionForm
        intro={
          subscriptionText ? (
            <EditorContent
              contents={subscriptionText}
              compact
              proseStyles={subscriptionProseStyles}
            />
          ) : null
        }
      />
    </main>
  );
}
