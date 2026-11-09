import { useEffect, useState, type FormEvent } from 'react'
import { useRepositories } from '../../data/DataProvider'
import { OBJECTS_BASE_PATH } from '../../lib/constants'
import {
  OBJECT_BENEFIT_TYPES,
  OBJECT_RARITIES,
  type GameObject,
  type ObjectBenefitType,
  type ObjectDefinitionInput,
  type ObjectRarity,
} from '../../lib/objects'

interface ObjectForm {
  name: string
  description: string
  rarity: ObjectRarity
  benefit: string
  benefitType: ObjectBenefitType
  benefitValue: string
  iconUrl: string
  origin: string
  isActive: boolean
}

const EMPTY_FORM: ObjectForm = {
  name: '',
  description: '',
  rarity: 'Inusual',
  benefit: '',
  benefitType: 'Cosmetic',
  benefitValue: '0',
  iconUrl: `${OBJECTS_BASE_PATH}/object-01.svg`,
  origin: 'BilboStack',
  isActive: true,
}

function toForm(definition: GameObject): ObjectForm {
  return {
    name: definition.name,
    description: definition.description,
    rarity: definition.rarity,
    benefit: definition.benefit,
    benefitType: definition.benefitType,
    benefitValue: String(definition.benefitValue),
    iconUrl: definition.iconUrl,
    origin: definition.origin,
    isActive: definition.isActive,
  }
}

function toInput(form: ObjectForm): ObjectDefinitionInput {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    rarity: form.rarity,
    benefit: form.benefit.trim(),
    benefitType: form.benefitType,
    benefitValue: Math.max(0, Number(form.benefitValue) || 0),
    iconUrl: form.iconUrl.trim() || `${OBJECTS_BASE_PATH}/object-01.svg`,
    origin: form.origin.trim(),
    isActive: form.isActive,
  }
}

export function AdminObjects() {
  const { inventory: inventoryRepository } = useRepositories()
  const [definitions, setDefinitions] = useState<GameObject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ObjectForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setDefinitions(await inventoryRepository.listAllDefinitions())
      setError('')
    } catch {
      setError('No se pudieron cargar los objetos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [inventoryRepository]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(definition: GameObject) {
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
        await inventoryRepository.updateDefinition(editingId, input)
      } else {
        await inventoryRepository.createDefinition(input)
      }
      closeForm()
      await load()
    } catch {
      setError('No se pudo guardar el objeto.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(definition: GameObject) {
    if (!window.confirm(`¿Eliminar el objeto "${definition.name}"?`)) return
    try {
      await inventoryRepository.deleteDefinition(definition.id)
      await load()
    } catch {
      setError('No se pudo eliminar el objeto.')
    }
  }

  async function toggleActive(definition: GameObject) {
    try {
      await inventoryRepository.updateDefinition(definition.id, {
        name: definition.name,
        description: definition.description,
        rarity: definition.rarity,
        benefit: definition.benefit,
        benefitType: definition.benefitType,
        benefitValue: definition.benefitValue,
        iconUrl: definition.iconUrl,
        origin: definition.origin,
        isActive: !definition.isActive,
      })
      await load()
    } catch {
      setError('No se pudo actualizar el objeto.')
    }
  }

  return (
    <section aria-label="Objetos" className="rounded-lg border border-primary bg-surface">
      <header className="flex flex-col gap-2 border-b border-primary px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[11px] font-bold text-accent">📦 Objetos</h2>
          <p className="mt-1 text-[9px] text-gray-500">
            {definitions.length} definiciones · {definitions.filter(item => item.isActive).length} activos
          </p>
        </div>
        <button type="button" onClick={openCreate} className="snes-button has-nature-color text-[8px]">
          Nuevo objeto
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
              placeholder="Nombre del objeto"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Origen
            <input
              value={form.origin}
              onChange={event => setForm({ ...form, origin: event.target.value })}
              className="snes-input"
              placeholder="BilboStack"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500 md:col-span-2">
            Descripción
            <input
              value={form.description}
              onChange={event => setForm({ ...form, description: event.target.value })}
              className="snes-input"
              placeholder="Qué hace o representa"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Rareza
            <select
              value={form.rarity}
              onChange={event => setForm({ ...form, rarity: event.target.value as ObjectRarity })}
              className="snes-input"
            >
              {OBJECT_RARITIES.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Tipo de beneficio
            <select
              value={form.benefitType}
              onChange={event => setForm({
                ...form,
                benefitType: event.target.value as ObjectBenefitType,
              })}
              className="snes-input"
            >
              {OBJECT_BENEFIT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Beneficio
            <input
              value={form.benefit}
              onChange={event => setForm({ ...form, benefit: event.target.value })}
              className="snes-input"
              placeholder="+1 Expertise al equiparlo"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500">
            Valor del beneficio
            <input
              type="number"
              min={0}
              value={form.benefitValue}
              onChange={event => setForm({ ...form, benefitValue: event.target.value })}
              className="snes-input"
            />
          </label>
          <label className="flex flex-col gap-1 text-[9px] text-gray-500 md:col-span-2">
            URL del icono
            <input
              value={form.iconUrl}
              onChange={event => setForm({ ...form, iconUrl: event.target.value })}
              className="snes-input"
              placeholder={`${OBJECTS_BASE_PATH}/object-01.svg`}
            />
          </label>
          <div className="flex items-end text-[9px] text-gray-400 md:col-span-2">
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
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear objeto'}
            </button>
            <button type="button" onClick={closeForm} className="snes-button has-phantom-color text-[8px]">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="px-4 py-8 text-center text-[9px] text-gray-500">Cargando objetos...</p>
      ) : definitions.length === 0 ? (
        <p className="px-4 py-8 text-center text-[9px] text-gray-500">No hay objetos definidos.</p>
      ) : (
        <ul className="divide-y divide-primary">
          {definitions.map(definition => (
            <li key={definition.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
              <img
                src={definition.iconUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded border border-primary bg-background object-contain p-1"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white">{definition.name}</p>
                <p className="text-[8px] text-gray-500">{definition.description}</p>
                <p className="mt-1 text-[8px] text-tech">
                  {definition.rarity} · {definition.benefitType}
                  {definition.benefitValue > 0 ? ` +${definition.benefitValue}` : ''}
                </p>
              </div>
              <span
                className={[
                  'w-fit rounded-full border px-2 py-1 text-[8px] font-bold',
                  definition.isActive
                    ? 'border-secondary text-secondary'
                    : 'border-primary text-gray-500',
                ].join(' ')}
              >
                {definition.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(definition)} className="snes-button text-[8px]">
                  Editar
                </button>
                <button type="button" onClick={() => void toggleActive(definition)} className="snes-button text-[8px]">
                  {definition.isActive ? 'Desactivar' : 'Activar'}
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
