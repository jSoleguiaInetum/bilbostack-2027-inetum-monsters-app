import { useEffect, useState, type FormEvent } from 'react'
import { useRepositories } from '../../data/DataProvider'
import {
  ACHIEVEMENT_CONDITION_TYPES,
  type Achievement,
  type AchievementConditionType,
  type AchievementDefinitionInput,
} from '../../lib/achievements'
import type { GameObject } from '../../lib/objects'

interface AchievementForm {
  name: string
  description: string
  icon: string
  hidden: boolean
  objectId: string
  isActive: boolean
  conditionType: AchievementConditionType
  conditionTarget: string
}

const EMPTY_FORM: AchievementForm = {
  name: '',
  description: '',
  icon: '🏅',
  hidden: false,
  objectId: '',
  isActive: true,
  conditionType: 'contacts',
  conditionTarget: '1',
}

function toForm(definition: Achievement): AchievementForm {
  return {
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    hidden: definition.hidden,
    objectId: definition.objectId ?? '',
    isActive: definition.isActive !== false,
    conditionType: definition.conditionType ?? 'contacts',
    conditionTarget: String(definition.conditionTarget ?? 1),
  }
}

function toInput(form: AchievementForm): AchievementDefinitionInput {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    icon: form.icon.trim() || '🏅',
    hidden: form.hidden,
    objectId: form.objectId || undefined,
    isActive: form.isActive,
    conditionType: form.conditionType,
    conditionTarget: Math.max(1, Number(form.conditionTarget) || 1),
  }
}

function conditionLabel(definition: Achievement): string {
  const type = ACHIEVEMENT_CONDITION_TYPES.find(
    option => option.value === definition.conditionType,
  )
  if (!type) return 'Condición personalizada'
  return `${type.label} ≥ ${definition.conditionTarget ?? 1}`
}

export function AdminAchievements() {
  const { achievements: achievementsRepository, inventory: inventoryRepository } = useRepositories()
  const [definitions, setDefinitions] = useState<Achievement[]>([])
  const [objects, setObjects] = useState<GameObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AchievementForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [nextDefinitions, nextObjects] = await Promise.all([
        achievementsRepository.listAllDefinitions(),
        inventoryRepository.listAllDefinitions(),
      ])
      setDefinitions(nextDefinitions)
      setObjects(nextObjects)
      setError('')
    } catch {
      setError('No se pudieron cargar los logros.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [achievementsRepository, inventoryRepository]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(definition: Achievement) {
    setEditingId(definition.id)
    setForm(toForm(definition))
    setShowForm(true)
  }

  function closeForm() {
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const input = toInput(form)
    if (!input.name || !input.description) {
      setError('El nombre y la descripción son obligatorios.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await achievementsRepository.updateDefinition(editingId, input)
      } else {
        await achievementsRepository.createDefinition(input)
      }
      closeForm()
      await load()
    } catch {
      setError('No se pudo guardar el logro.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(definition: Achievement) {
    if (!window.confirm(`¿Eliminar el logro "${definition.name}"?`)) return
    try {
      await achievementsRepository.deleteDefinition(definition.id)
      await load()
    } catch {
      setError('No se pudo eliminar el logro.')
    }
  }

  async function toggleActive(definition: Achievement) {
    try {
      await achievementsRepository.updateDefinition(definition.id, {
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        hidden: definition.hidden,
        objectId: definition.objectId,
        isActive: definition.isActive === false,
        conditionType: definition.conditionType ?? 'contacts',
        conditionTarget: definition.conditionTarget ?? 1,
      })
      await load()
    } catch {
      setError('No se pudo actualizar el logro.')
    }
  }

  return (
    <section aria-label="Logros" className="rounded-lg border border-primary bg-surface">
      <header className="flex flex-col gap-2 border-b border-primary px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[11px] font-bold text-accent">🏅 Logros</h2>
          <p className="mt-1 text-[9px] text-gray-500">
            {definitions.length} definiciones · {definitions.filter(item => item.isActive !== false).length} activos
          </p>
        </div>
        <button type="button" onClick={openCreate} className="snes-button has-nature-color text-[8px]">
          Nuevo logro
        </button>
      </header>

      {error && (
        <p className="border-b border-primary px-4 py-2 text-[9px] text-secondary">{error}</p>
      )}

      {showForm && (
        <form onSubmit={event => void submit(event)} className="grid gap-3 border-b border-primary px-4 py-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Nombre
            <input
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
              className="snes-input"
              placeholder="Nombre del logro"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Icono
            <input
              value={form.icon}
              onChange={event => setForm({ ...form, icon: event.target.value })}
              className="snes-input"
              placeholder="🏅"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500 md:col-span-2">
            Descripción
            <input
              value={form.description}
              onChange={event => setForm({ ...form, description: event.target.value })}
              className="snes-input"
              placeholder="Cómo se consigue"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Condición
            <select
              value={form.conditionType}
              onChange={event => setForm({
                ...form,
                conditionType: event.target.value as AchievementConditionType,
              })}
              className="snes-input"
            >
              {ACHIEVEMENT_CONDITION_TYPES.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Objetivo
            <input
              type="number"
              min={1}
              value={form.conditionTarget}
              onChange={event => setForm({ ...form, conditionTarget: event.target.value })}
              className="snes-input"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Objeto de recompensa
            <select
              value={form.objectId}
              onChange={event => setForm({ ...form, objectId: event.target.value })}
              className="snes-input"
            >
              <option value="">Sin objeto</option>
              {objects.map(object => (
                <option key={object.id} value={object.id}>{object.name}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-end gap-4 text-[9px] text-gray-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={event => setForm({ ...form, hidden: event.target.checked })}
              />
              Oculto
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={event => setForm({ ...form, isActive: event.target.checked })}
              />
              Activo
            </label>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" disabled={saving} className="snes-button has-nature-color text-[8px]">
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear logro'}
            </button>
            <button type="button" onClick={closeForm} className="snes-button has-phantom-color text-[8px]">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="px-4 py-8 text-center text-[9px] text-gray-500">Cargando logros...</p>
      ) : definitions.length === 0 ? (
        <p className="px-4 py-8 text-center text-[9px] text-gray-500">No hay logros definidos.</p>
      ) : (
        <ul className="divide-y divide-primary">
          {definitions.map(definition => (
            <li key={definition.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
              <span className="text-xl">{definition.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white">
                  {definition.name}
                  {definition.hidden && <span className="ml-2 text-[8px] text-accent">Oculto</span>}
                </p>
                <p className="text-[8px] text-gray-500">{definition.description}</p>
                <p className="mt-1 text-[8px] text-tech">{conditionLabel(definition)}</p>
              </div>
              <span
                className={[
                  'w-fit rounded-full border px-2 py-1 text-[8px] font-bold',
                  definition.isActive !== false
                    ? 'border-secondary text-secondary'
                    : 'border-primary text-gray-500',
                ].join(' ')}
              >
                {definition.isActive !== false ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(definition)} className="snes-button text-[8px]">
                  Editar
                </button>
                <button type="button" onClick={() => void toggleActive(definition)} className="snes-button text-[8px]">
                  {definition.isActive !== false ? 'Desactivar' : 'Activar'}
                </button>
                <button type="button" onClick={() => void remove(definition)} className="snes-button has-rose-color text-[8px]">
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
