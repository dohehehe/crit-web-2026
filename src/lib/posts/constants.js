export const POST_LIST_SELECT = `
  id,
  title,
  slug,
  thumnail_img,
  date,
  sort_order,
  categories ( id, name, slug ),
  sections ( id, name, slug ),
  issues ( issue_number ),
  post_keywords ( keywords ( id, name, slug ) )
`;

export const POST_DETAIL_SELECT = `
  id,
  title,
  subtitle,
  slug,
  content,
  thumnail_img,
  date,
  categories ( id, name, slug ),
  sections ( id, name, slug ),
  issues ( issue_number ),
  authors ( id, name ),
  post_keywords ( keywords ( id, name, slug ) )
`;

export const DEFAULT_POST_LIST_LIMIT = 50;
