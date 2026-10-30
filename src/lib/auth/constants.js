export const SUBSCRIBER_ROLE_NAME = "subscriber";
export const ADMIN_ROLE_NAME = "admin";

export const MIN_PASSWORD_LENGTH = 8;

export const SUBSCRIBER_ONLY_ALERT = {
  title: "알림",
  message: "구독자만 열람 가능합니다.",
  confirmLabel: "회원가입",
};

export const EMAIL_CONFIRMED_ALERT = {
  title: "인증 완료",
  message: "인증이 완료되었습니다. 로그인해 주세요.",
};

export const SIGNUP_VERIFICATION_ALERT = {
  title: "이메일 인증 안내",
  message:
    "구독자가 되어 주셔서 감사합니다.\n\n가입하신 이메일로 인증 메일을 보냈습니다. 이메일 인증을 완료해 주세요.\n최대 5분 정도 소요될 수 있습니다.\n\n이메일이 오지 않으면 가입하신 이메일을 확인하거나 journal.crit@gmail.com로 문의해 주세요.",
};

export const UNSUBSCRIBE_CONFIRM_ALERT = {
  title: "구독 취소",
  message:
    "구독을 취소하면 회원 탈퇴로 처리됩니다. 계정과 회원 정보가 삭제되며 되돌릴 수 없습니다. 계속할까요?",
};
