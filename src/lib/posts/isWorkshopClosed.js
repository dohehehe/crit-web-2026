import { getSectionMode } from "@/lib/admin/section-mode";
import {
  getWorkshopStatus,
  WORKSHOP_STATUS,
} from "@/lib/admin/workshop-status";

export function isWorkshopClosed(post, now = new Date()) {
  if (!post?.section || getSectionMode(post.section) !== "workshop") {
    return false;
  }

  return (
    getWorkshopStatus(
      {
        start_at: post.startAt ?? post.start_at ?? null,
        end_at: post.endAt ?? post.end_at ?? null,
      },
      now
    ) === WORKSHOP_STATUS.CLOSED
  );
}
