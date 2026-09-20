"use server";

import { redirect } from "next/navigation";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";
import { getSubscriberRoleId } from "@/lib/auth/getSubscriberRoleId";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function readString(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(_prevState, formData) {
  const email = normalizeEmail(formData.get("email"));
  const password = formData.get("password");

  if (!email) {
    return { error: "이메일을 입력해 주세요." };
  }

  if (typeof password !== "string" || !password) {
    return { error: "비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  redirect("/");
}

export async function signUpAction(_prevState, formData) {
  const name = readString(formData, "name");
  const email = normalizeEmail(formData.get("email"));
  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");
  const privacyConsent = formData.get("privacyConsent") === "on";
  const newsletterConsent = formData.get("newsletterConsent") === "on";

  if (!name) {
    return { error: "이름을 입력해 주세요." };
  }

  if (!email) {
    return { error: "이메일을 입력해 주세요." };
  }

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`,
    };
  }

  if (password !== passwordConfirm) {
    return { error: "비밀번호 확인이 일치하지 않습니다." };
  }

  if (!privacyConsent) {
    return { error: "개인정보 수집·이용에 동의해 주세요." };
  }

  const supabase = await createClient();
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        privacy_consent: privacyConsent,
        newsletter_consent: newsletterConsent,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const authUser = data.user;

  if (!authUser?.id) {
    return {
      error:
        "회원가입 요청을 처리했습니다. 이메일 확인이 필요하면 메일함을 확인해 주세요.",
    };
  }

  let roleId;

  try {
    roleId = await getSubscriberRoleId();
  } catch (roleError) {
    return {
      error:
        roleError instanceof Error
          ? roleError.message
          : "기본 역할을 불러오지 못했습니다.",
    };
  }

  const admin = createAdminClient();
  const { error: insertError } = await admin.from("users").insert({
    id: authUser.id,
    name,
    email,
    role_id: roleId,
  });

  if (insertError) {
    await admin.auth.admin.deleteUser(authUser.id);
    return { error: insertError.message };
  }

  if (data.session) {
    redirect("/");
  }

  redirect("/login?registered=1");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
