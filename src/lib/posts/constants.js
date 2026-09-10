export const POST_LIST_SELECT = `
  id,
  title,
  slug,
  thumnail_img,
  date,
  sort_order,
  categories ( id, name, slug ),
  sections ( id, name, slug ),
  post_keywords ( keywords ( id, name, slug ) )
`;

export const DEFAULT_POST_LIST_LIMIT = 50;
