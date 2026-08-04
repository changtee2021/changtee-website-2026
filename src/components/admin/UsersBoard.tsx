"use client";

import { useMemo, useState } from "react";
import { Check, Info, Plus, Shield, UserRound, X } from "lucide-react";
import {
  APP_ROLES,
  APP_ROLE_DESCRIPTIONS,
  APP_ROLE_LABELS,
  DEMO_STAFF,
  PERMISSION_LABELS,
  ROLE_PERMISSIONS,
  type AppRole,
  type PermissionKey,
  type StaffUser,
} from "@/lib/admin-users";
import { cn } from "@/lib/utils";

const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as PermissionKey[];

export function UsersBoard() {
  const [users, setUsers] = useState<StaffUser[]>(DEMO_STAFF);
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [rolesInfoOpen, setRolesInfoOpen] = useState(false);

  const filtered = useMemo(
    () =>
      roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter),
    [users, roleFilter],
  );

  const counts = useMemo(() => {
    const map = { admin: 0, editor: 0, sales: 0, active: 0 };
    for (const u of users) {
      map[u.role] += 1;
      if (u.active) map.active += 1;
    }
    return map;
  }, [users]);

  function upsertUser(next: StaffUser) {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === next.id);
      if (idx === -1) return [next, ...prev];
      const copy = [...prev];
      copy[idx] = next;
      return copy;
    });
    setEditing(null);
    setCreating(false);
  }

  function openCreate() {
    setCreating(true);
    setEditing({
      id: `staff-${Date.now()}`,
      employeeCode: "",
      fullName: "",
      email: "",
      phone: "",
      role: "sales",
      active: true,
      note: "",
      tempPassword: "",
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy sm:text-2xl">
              ผู้ใช้และบทบาท
            </h2>
            <p className="mt-1 text-sm text-muted">
              แอดมินเพิ่มผู้ใช้เอง · รหัสพนักงาน = ID login (พรุ่งนี้เปิดใช้จริง)
              <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                ยังไม่บังคับ login
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRolesInfoOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-navy bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-paper"
            >
              <Info className="size-4" />
              ข้อมูลบทบาท / สิทธิ์
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
            >
              <Plus className="size-4" />
              เพิ่มผู้ใช้
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap gap-2">
          <RoleChip
            active={roleFilter === "all"}
            onClick={() => setRoleFilter("all")}
            label={`ทั้งหมด (${users.length})`}
          />
          {APP_ROLES.map((role) => (
            <RoleChip
              key={role}
              active={roleFilter === role}
              onClick={() => setRoleFilter(role)}
              label={`${APP_ROLE_LABELS[role]} (${counts[role]})`}
            />
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">รหัสพนักงาน</th>
                <th className="px-4 py-3 font-medium">ชื่อ</th>
                <th className="px-4 py-3 font-medium">เบอร์</th>
                <th className="px-4 py-3 font-medium">บทบาท</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-navy">
                    {user.employeeCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-navy/10 text-navy">
                        <UserRound className="size-4" />
                      </span>
                      <div>
                        <div className="font-medium text-navy">{user.fullName}</div>
                        <div className="text-xs text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-navy">
                      {APP_ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        user.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-paper text-muted",
                      )}
                    >
                      {user.active ? "ใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-sm font-medium text-brand-red hover:underline"
                      onClick={() => {
                        setCreating(false);
                        setEditing(user);
                      }}
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {rolesInfoOpen ? (
        <RolesInfoModal onClose={() => setRolesInfoOpen(false)} />
      ) : null}

      {editing ? (
        <UserFormModal
          user={editing}
          isCreate={creating}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={upsertUser}
        />
      ) : null}
    </div>
  );
}

function RolesInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lg sm:max-h-[85vh] sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-navy">
              ข้อมูลบทบาทและสิทธิ์
            </h3>
            <p className="mt-1 text-sm text-muted">
              สิทธิ์ของแอดมิน / แก้ไขคอนเทนต์ / เซลล์
            </p>
          </div>
          <button
            type="button"
            aria-label="ปิด"
            className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-navy"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {APP_ROLES.map((role) => (
            <div
              key={role}
              className="rounded-xl border border-line bg-paper/60 p-4"
            >
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-brand-red" />
                <h4 className="font-display text-base font-semibold text-navy">
                  {APP_ROLE_LABELS[role]}
                </h4>
              </div>
              <p className="mt-1 text-xs text-muted">
                {APP_ROLE_DESCRIPTIONS[role]}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {PERMISSION_KEYS.map((perm) => {
                  const allowed = ROLE_PERMISSIONS[role].includes(perm);
                  return (
                    <li key={perm} className="flex items-start gap-2">
                      {allowed ? (
                        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                      ) : (
                        <X className="mt-0.5 size-3.5 shrink-0 text-line" />
                      )}
                      <span className={allowed ? "text-navy" : "text-muted"}>
                        {PERMISSION_LABELS[perm]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-sm",
        active
          ? "border-navy bg-navy text-white"
          : "border-line bg-paper text-ink hover:border-navy/30",
      )}
    >
      {label}
    </button>
  );
}

function UserFormModal({
  user,
  isCreate,
  onClose,
  onSave,
}: {
  user: StaffUser;
  isCreate: boolean;
  onClose: () => void;
  onSave: (user: StaffUser) => void;
}) {
  const [form, setForm] = useState(user);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeCode.trim() || !form.fullName.trim() || !form.email.trim()) {
      alert("กรอกรหัสพนักงาน ชื่อ และอีเมลให้ครบ");
      return;
    }
    if (isCreate && !form.tempPassword?.trim()) {
      alert("ตั้งรหัสผ่านเริ่มต้นให้ผู้ใช้ใหม่ (เตรียมไว้สำหรับ login พรุ่งนี้)");
      return;
    }
    onSave({
      ...form,
      employeeCode: form.employeeCode.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      tempPassword: form.tempPassword?.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <form
        onSubmit={submit}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-navy">
              {isCreate ? "เพิ่มผู้ใช้" : "แก้ไขผู้ใช้"}
            </h3>
            <p className="text-sm text-muted">บันทึกในหน้านี้ (demo) — ยังไม่เขียน Auth จริง</p>
          </div>
          <button
            type="button"
            aria-label="ปิด"
            className="rounded-lg p-1.5 text-muted hover:bg-paper"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted">
            รหัสพนักงาน (ID login)
            <input
              value={form.employeeCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, employeeCode: e.target.value }))
              }
              placeholder="เช่น 000000"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-mono text-sm text-navy"
              required
            />
          </label>
          <label className="text-xs text-muted">
            รหัสผ่านเริ่มต้น
            <input
              type="text"
              value={form.tempPassword || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, tempPassword: e.target.value }))
              }
              placeholder={isCreate ? "ตั้งรหัสให้ผู้ใช้ใหม่" : "เว้นว่างถ้าไม่เปลี่ยน"}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            />
            <span className="mt-1 block text-[11px] text-muted">
              เก็บใน demo เท่านั้น — พรุ่งนี้ย้ายไป Supabase Auth
            </span>
          </label>
          <label className="text-xs text-muted sm:col-span-2">
            ชื่อ-นามสกุล / ชื่อเล่นเซลล์
            <input
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
              required
            />
          </label>
          <label className="text-xs text-muted">
            อีเมล
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
              required
            />
          </label>
          <label className="text-xs text-muted">
            เบอร์โทร
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            />
          </label>
          <label className="text-xs text-muted">
            บทบาท
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as AppRole }))
              }
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            >
              {APP_ROLES.map((role) => (
                <option key={role} value={role}>
                  {APP_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-navy sm:mt-6">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            เปิดใช้งาน
          </label>
          <label className="text-xs text-muted sm:col-span-2">
            หมายเหตุ
            <textarea
              value={form.note || ""}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-navy"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="rounded-xl bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-deep"
          >
            บันทึก
          </button>
        </div>
      </form>
    </div>
  );
}
