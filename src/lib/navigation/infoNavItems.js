export const INFO_NAV_ITEMS = [
  {
    href: "/about",
    label: "About Crit",
    activeLabel: "크릿 소개",
  },
  {
    href: "/notice",
    label: "Notice",
    activeLabel: "공지사항",
  },
  {
    href: "/submission",
    label: "Submission",
    activeLabel: "투고",
  },
  {
    href: "/subscription",
    label: "Subscription",
    activeLabel: "구독 회원 가입",
  },
  {
    href: "/login",
    label: "Login",
    activeLabel: "로그인",
  },
];

export const MYPAGE_NAV_ITEM = {
  href: "/mypage",
  label: "My Page",
  activeLabel: "내 정보",
};

export function getInfoNavItems(isLoggedIn) {
  return INFO_NAV_ITEMS.map((item) => {
    if (item.href === "/login") {
      return isLoggedIn ? MYPAGE_NAV_ITEM : item;
    }

    return item;
  });
}

export function isInfoNavActive(pathname, href) {
  if (pathname === href) {
    return true;
  }

  return href !== "/" && pathname.startsWith(`${href}/`);
}

export function getInfoNavLabel(item, isActive) {
  if (isActive) {
    return item.activeLabel;
  }

  return item.label;
}
