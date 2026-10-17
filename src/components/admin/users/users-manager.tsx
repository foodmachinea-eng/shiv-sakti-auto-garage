"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { Modal, Toggle, useConfirm } from "@/components/admin/ui-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select, describedBy } from "@/components/ui/field";
import { ROLES } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { apiRequest, type ApiClientError } from "@/lib/client-api";

export type UserView = { id: number; name: string; email: string; role: string; isActive: boolean; lastLoginAt: string | null };

const PASSWORD_HINT = "At least 8 characters, including a letter and a number.";

export function UsersManager({ users, currentUserId }: { users: UserView[]; currentUserId: number }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [creating, setCreating] = useState<{ name: string; email: string; role: string; password: string } | null>(null);
  const [editing, setEditing] = useState<(UserView & { password: string }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!creating) return;
    setSaving(true);
    setErrors({});
    try {
      await apiRequest("/api/admin/users", { body: creating });
      toast.success(`Account created for ${creating.name}. Share the password with them securely.`);
      setCreating(null);
      router.refresh();
    } catch (e) {
      const err = e as ApiClientError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function update() {
    if (!editing) return;
    setSaving(true);
    setErrors({});
    const original = users.find((u) => u.id === editing.id)!;
    const body: Record<string, unknown> = {};
    if (editing.name !== original.name) body.name = editing.name;
    if (editing.role !== original.role) body.role = editing.role;
    if (editing.isActive !== original.isActive) body.isActive = editing.isActive;
    if (editing.password) body.password = editing.password;
    if (!Object.keys(body).length) {
      setEditing(null);
      setSaving(false);
      return;
    }
    try {
      await apiRequest(`/api/admin/users/${editing.id}`, { method: "PATCH", body });
      toast.success("Account updated");
      setEditing(null);
      router.refresh();
    } catch (e) {
      const err = e as ApiClientError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-5">
        <Button
          onClick={() => {
            setErrors({});
            setCreating({ name: "", email: "", role: "staff", password: "" });
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add a user
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white ring-1 ring-line">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[0.9rem]">
            <thead className="border-b border-line bg-paper text-[0.78rem] text-slate">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Last sign-in</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3.5">
                    <span className="font-medium">{u.name}</span>
                    {u.id === currentUserId && <span className="ml-2 text-[0.8rem] text-slate">(you)</span>}
                    <span className="block text-[0.82rem] text-slate">{u.email}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={u.role === "admin" ? "dark" : "neutral"}>{ROLES.find((r) => r.value === u.role)?.label ?? u.role}</Badge>
                  </td>
                  <td className="px-4 py-3.5">{u.isActive ? <Badge tone="green">Active</Badge> : <Badge tone="neutral">Deactivated</Badge>}</td>
                  <td className="px-4 py-3.5 text-slate">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setEditing({ ...u, password: "" });
                        }}
                        className="rounded-md p-2 text-slate hover:bg-paper hover:text-charcoal"
                        aria-label={`Edit ${u.name}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await confirm({ title: `Delete ${u.name}'s account?`, message: "They will no longer be able to sign in. To block access temporarily, deactivate the account instead.", confirmLabel: "Delete account", danger: true });
                            if (!ok) return;
                            try {
                              await apiRequest(`/api/admin/users/${u.id}`, { method: "DELETE" });
                              toast.success("Account deleted");
                              router.refresh();
                            } catch (e) {
                              toast.error((e as Error).message);
                            }
                          }}
                          className="rounded-md p-2 text-slate hover:bg-[#fdecec] hover:text-[#b42318]"
                          aria-label={`Delete ${u.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r.value} className="rounded-lg bg-white p-4 ring-1 ring-line">
            <dt className="font-semibold">{r.label}</dt>
            <dd className="text-[0.88rem] text-slate">{r.description}</dd>
          </div>
        ))}
      </dl>

      <Modal
        open={!!creating}
        onClose={() => setCreating(null)}
        title="Add a user"
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={() => setCreating(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={create}>
              Create account
            </Button>
          </>
        }
      >
        {creating && (
          <div className="grid gap-5">
            <Field label="Name" htmlFor="u-name" required error={errors.name}>
              <Input id="u-name" data-autofocus value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} {...describedBy("u-name", errors.name)} />
            </Field>
            <Field label="Email" htmlFor="u-email" required error={errors.email}>
              <Input id="u-email" type="email" autoComplete="off" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} {...describedBy("u-email", errors.email)} />
            </Field>
            <Field label="Role" htmlFor="u-role" required>
              <Select id="u-role" value={creating.role} onChange={(e) => setCreating({ ...creating, role: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}: {r.description}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Temporary password" htmlFor="u-pass" required error={errors.password} hint={PASSWORD_HINT}>
              <Input id="u-pass" type="text" autoComplete="new-password" value={creating.password} onChange={(e) => setCreating({ ...creating, password: e.target.value })} {...describedBy("u-pass", errors.password, true)} />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : "Edit user"}
        description={editing?.email}
        footer={
          <>
            <Button variant="subtle" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={update}>
              Save changes
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-5">
            <Field label="Name" htmlFor="e-name" required error={errors.name}>
              <Input id="e-name" data-autofocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Role" htmlFor="e-role" required error={errors.role}>
              <Select id="e-role" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} disabled={editing.id === currentUserId}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Field>
            {editing.id !== currentUserId && (
              <Toggle label="Account active" description="Deactivated users are signed out and can't sign in." checked={editing.isActive} onChange={(v) => setEditing({ ...editing, isActive: v })} />
            )}
            <Field label="Set a new password" htmlFor="e-pass" error={errors.password} hint={`Optional. ${PASSWORD_HINT} Signs the user out everywhere.`}>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
                <Input id="e-pass" type="text" autoComplete="new-password" className="pl-9" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} {...describedBy("e-pass", errors.password, true)} />
              </div>
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}
