import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Plus, UserCog, Users } from 'lucide-react';
import { Navbar } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useUsers } from '../hooks/useUsers';
import type { CreateUserPayload, UpdateUserPayload, UserClient, UserRecord, UserRole } from '../types';

interface UserFormState {
  name: string;
  email: string;
  password: string;
  roleId: string;
  clientId: string;
  active: boolean;
}

type ToastType = 'success' | 'error';

const initialFormState: UserFormState = {
  name: '',
  email: '',
  password: '',
  roleId: '',
  clientId: '',
  active: true,
};

function getRoleLabel(user: UserRecord): string {
  if (typeof user.role === 'string') {
    return user.role;
  }

  if (user.role?.name) {
    return user.role.name;
  }

  return user.roleId || 'Sin rol';
}

function getClientLabel(user: UserRecord): string {
  if (user.client?.name) {
    return user.client.name;
  }

  return user.clientId || 'Sin cliente';
}

function roleBadgeClass(roleName: string): string {
  const normalized = roleName.toLowerCase();

  if (normalized.includes('admin')) {
    return 'bg-rose-50 text-rose-700 ring-rose-200';
  }

  if (normalized.includes('agent')) {
    return 'bg-sky-50 text-sky-700 ring-sky-200';
  }

  if (normalized.includes('viewer')) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  }

  return 'bg-gray-100 text-gray-700 ring-gray-200';
}

export function UserManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const { users, roles, clients, isLoading, error, getUsers, createUser, updateUser, toggleUserStatus } = useUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [formState, setFormState] = useState<UserFormState>(initialFormState);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UserRecord | null>(null);

  const isAdmin = useMemo(() => {
    const roleValue = (user as { role?: unknown } | null)?.role;
    const normalizedRole =
      typeof roleValue === 'string'
        ? roleValue
        : roleValue && typeof roleValue === 'object' && 'name' in roleValue
          ? String((roleValue as { name?: string }).name ?? '')
          : user?.roleId ?? '';

    return normalizedRole.toLowerCase() === 'admin';
  }, [user]);

  useEffect(() => {
    if (!isAdmin || authLoading) {
      return;
    }

    void getUsers();
  }, [isAdmin, authLoading, getUsers]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => clearTimeout(timeout);
  }, [toast]);

  const safeRoles: UserRole[] = roles;
  const safeClients: UserClient[] = clients;

  const openCreate = () => {
    setEditingUser(null);
    setFormState({
      ...initialFormState,
      roleId: safeRoles[0]?.id ?? '',
      clientId: safeClients[0]?.id ?? '',
    });
    setModalOpen(true);
  };

  const openEdit = (record: UserRecord) => {
    setEditingUser(record);
    setFormState({
      name: record.name,
      email: record.email,
      password: '',
      roleId: record.roleId,
      clientId: record.clientId,
      active: record.active,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitLoading) {
      return;
    }
    setModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingUser) {
        const payload: UpdateUserPayload = {
          name: formState.name.trim(),
          email: formState.email.trim(),
          roleId: formState.roleId,
          active: formState.active,
        };

        await updateUser(editingUser.id, payload);
        setToast({ type: 'success', message: 'Usuario actualizado correctamente.' });
      } else {
        const payload: CreateUserPayload = {
          name: formState.name.trim(),
          email: formState.email.trim(),
          password: formState.password,
          roleId: formState.roleId,
          active: formState.active,
        };

        await createUser(payload);
        setToast({ type: 'success', message: 'Usuario creado correctamente.' });
      }

      setModalOpen(false);
    } catch (requestError) {
      console.error(requestError);
      setToast({ type: 'error', message: 'No se pudo guardar el usuario.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleConfirmed = async () => {
    if (!confirmTarget) {
      return;
    }

    try {
      await toggleUserStatus(confirmTarget);
      const message = confirmTarget.active ? 'Usuario desactivado.' : 'Usuario activado.';
      setToast({ type: 'success', message });
    } catch (requestError) {
      console.error(requestError);
      setToast({ type: 'error', message: 'No se pudo cambiar el estado del usuario.' });
    } finally {
      setConfirmTarget(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_35%,_#e2e8f0)] pt-20 sm:pt-24">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-2xl border border-cyan-100 bg-white/80 p-5 shadow-lg shadow-cyan-100/40 backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-700">
                <Users className="h-3.5 w-3.5" />
                PANEL DE USUARIOS
              </p>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Gestion de usuarios</h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Administra accesos por rol y cliente con control de estado activo/inactivo.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
            >
              <Plus className="h-4 w-4" />
              Crear Usuario
            </button>
          </div>
        </section>

        {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
            <p className="mt-4 text-sm text-slate-600">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:hidden">
              {users.map((entry) => {
                const roleLabel = getRoleLabel(entry);
                const clientLabel = getClientLabel(entry);

                return (
                  <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-slate-900">{entry.name}</h2>
                        <p className="text-sm text-slate-500">{entry.email}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${roleBadgeClass(roleLabel)}`}
                      >
                        {roleLabel}
                      </span>
                    </div>

                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Cliente</dt>
                        <dd className="font-medium text-slate-700">{clientLabel}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-500">Estado</dt>
                        <dd
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            entry.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {entry.active ? 'Activo' : 'Inactivo'}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(entry)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmTarget(entry)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
                          entry.active ? 'bg-rose-500 hover:bg-rose-400' : 'bg-emerald-600 hover:bg-emerald-500'
                        }`}
                      >
                        {entry.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((entry) => {
                    const roleLabel = getRoleLabel(entry);
                    const clientLabel = getClientLabel(entry);

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{entry.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{entry.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${roleBadgeClass(roleLabel)}`}
                          >
                            {roleLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{clientLabel}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              entry.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {entry.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(entry)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmTarget(entry)}
                              className={`rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
                                entry.active ? 'bg-rose-500 hover:bg-rose-400' : 'bg-emerald-600 hover:bg-emerald-500'
                              }`}
                            >
                              {entry.active ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!isLoading && users.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
            <UserCog className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-semibold text-slate-800">Sin usuarios para mostrar</h3>
            <p className="mt-2 text-sm text-slate-500">Crea tu primer usuario para comenzar.</p>
          </div>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 md:items-center">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{editingUser ? 'Editar usuario' : 'Crear usuario'}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingUser ? 'Actualiza rol, cliente o estado del usuario.' : 'Completa los datos para registrar un nuevo usuario.'}
                </p>
              </div>
              <Building2 className="h-5 w-5 text-cyan-600" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  id="name"
                  required
                  value={formState.name}
                  onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {!editingUser && (
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={formState.password}
                    onChange={(event) => setFormState((previous) => ({ ...previous, password: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="roleId" className="mb-1 block text-sm font-medium text-slate-700">
                    Rol
                  </label>
                  <select
                    id="roleId"
                    required
                    value={formState.roleId}
                    onChange={(event) => setFormState((previous) => ({ ...previous, roleId: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="" disabled>
                      Seleccionar rol
                    </option>
                    {safeRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="clientId" className="mb-1 block text-sm font-medium text-slate-700">
                    Cliente
                  </label>
                  <select
                    id="clientId"
                    required
                    value={formState.clientId}
                    onChange={(event) => setFormState((previous) => ({ ...previous, clientId: event.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="" disabled>
                      Seleccionar cliente
                    </option>
                    {safeClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingUser && (
                <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.active}
                    onChange={(event) => setFormState((previous) => ({ ...previous, active: event.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  Usuario activo
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !formState.roleId}
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
            {!formState.roleId && (
              <p className="mt-3 text-xs text-amber-700">
                No hay roles disponibles para asignar. Crea o habilita usuarios con roles distintos en backend.
              </p>
            )}
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {confirmTarget.active ? 'Desactivar usuario' : 'Activar usuario'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {confirmTarget.active
                ? 'El usuario perdera acceso a la plataforma hasta reactivarlo.'
                : 'El usuario recuperara el acceso a la plataforma.'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleToggleConfirmed}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  confirmTarget.active ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
