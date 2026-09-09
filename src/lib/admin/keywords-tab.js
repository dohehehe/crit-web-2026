export const KEYWORDS_TAB_ID = "keywords";

export const KEYWORDS_TAB = {
  id: KEYWORDS_TAB_ID,
  name: "Keywords",
};

export function isKeywordsTabSelected(selectedId) {
  return selectedId === KEYWORDS_TAB_ID;
}

export function getKeywordPostCount(keyword) {
  const countData = keyword.post_keywords;

  if (Array.isArray(countData) && countData.length > 0) {
    return countData[0].count ?? 0;
  }

  return 0;
}
