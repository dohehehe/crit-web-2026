"use client";

import { useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { getRoleLabel } from "@/lib/auth/roleLabels";
import tableStyles from "@/components/admin/shared/admin-posts-table.module.css";
import styles from "@/components/admin/info/admin-users-table.module.css";

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

export function AdminUsersTable({ users, roles, onChanged }) {
  const { mutate: updateUser } = useApiMutation("PATCH");
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [roleOverrides, setRoleOverrides] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleRoleChange(user, nextRoleId) {
    if (!nextRoleId || nextRoleId === user.role_id) {
      return;
    }

    setErrorMessage(null);
    setPendingIds((prev) => new Set(prev).add(user.id));
    setRoleOverrides((prev) => ({ ...prev, [user.id]: nextRoleId }));

    let saved = false;
    let refreshed = false;

    try {
      await updateUser(`users/${user.id}`, { role_id: nextRoleId });
      saved = true;
      await onChanged?.();
      refreshed = true;
    } catch (error) {
      if (!saved) {
        setRoleOverrides((prev) => {
          const next = { ...prev };
          delete next[user.id];
          return next;
        });
      }
      setErrorMessage(error.message ?? "역할을 바꾸지 못했습니다.");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });

      if (refreshed) {
        setRoleOverrides((prev) => {
          const next = { ...prev };
          delete next[user.id];
          return next;
        });
      }
    }
  }

  if (users.length === 0) {
    return (
      <p className={`${tableStyles.empty} caption gray-65`}>
        표시할 사용자가 없습니다.
      </p>
    );
  }

  return (
    <>
      {errorMessage ? (
        <p className={`${styles.error} caption`}>
          역할을 바꾸지 못했습니다: {errorMessage}
        </p>
      ) : null}

      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
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
            {users.map((user) => {
              const isPending = pendingIds.has(user.id);
              const roleId = roleOverrides[user.id] ?? user.role_id ?? "";

              return (
                <tr key={user.id}>
                  <td className={`p ${tableStyles.dateCell}`}>
                    {formatCreatedAt(user.created_at)}
                  </td>
                  <td className="p">{user.name ?? "—"}</td>
                  <td className="p">{user.email ?? "—"}</td>
                  <td className="p">
                    <select
                      className={`${styles.roleSelect} caption`}
                      value={roleId}
                      aria-label={`${user.name ?? user.email ?? "사용자"} 역할`}
                      disabled={isPending || roles.length === 0}
                      onChange={(event) =>
                        handleRoleChange(user, event.target.value)
                      }
                    >
                      {roleId ? null : <option value="">선택</option>}
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {getRoleLabel(role.name)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
