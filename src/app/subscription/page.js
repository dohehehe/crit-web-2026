import { SubscriptionForm } from "@/components/auth/SubscriptionForm";
import { EditorContent } from "@/components/editor/EditorContent";
import { getSubscriptionText } from "@/lib/info/getSiteInfo";

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
            <EditorContent contents={subscriptionText} compact />
          ) : null
        }
      />
    </main>
  );
}
