"use client";

import styles from "./admin-posts-table.module.css";

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

export function AdminUsersTable({ users }) {
  if (users.length === 0) {
    return <p className={`${styles.empty} caption gray-65`}>표시할 사용자가 없습니다.</p>;
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
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className={`p ${styles.dateCell}`}>{formatCreatedAt(user.created_at)}</td>
              <td className="p">{user.name ?? "—"}</td>
              <td className="p">{user.email ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
