"use client";

import { getRoleLabel } from "@/lib/auth/roleLabels";
import styles from "@/components/admin/shared/admin-posts-table.module.css";

function formatCreatedAt(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("ko-KR");
}

function getUserRoleName(user) {
  if (typeof user.roles?.name === "string") {
    return user.roles.name;
  }

  if (Array.isArray(user.roles) && typeof user.roles[0]?.name === "string") {
    return user.roles[0].name;
  }

  return null;
}

export function AdminUsersTable({ users }) {
  if (users.length === 0) {
    return (
      <p className={`${styles.empty} caption gray-65`}>
        표시할 사용자가 없습니다.
      </p>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className="caption">
              Date
            </th>
            <th scope="col" className="caption">
              Name
            </th>
            <th scope="col" className="caption">
              Email
            </th>
            <th scope="col" className="caption">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className={`p ${styles.dateCell}`}>
                {formatCreatedAt(user.created_at)}
              </td>
              <td className="p">{user.name ?? "—"}</td>
              <td className="p">{user.email ?? "—"}</td>
              <td className="p">{getRoleLabel(getUserRoleName(user))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
