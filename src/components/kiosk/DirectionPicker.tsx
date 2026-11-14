const directions = [
  { value: 'IN', label: 'Entry' },
  { value: 'OUT', label: 'Exit' },
] as const

type Direction = (typeof directions)[number]['value']

export function DirectionPicker({
  name,
  selected,
  disabled,
  onChange,
}: {
  name: string
  selected?: Direction
  disabled?: boolean
  onChange?: (direction: Direction) => void
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-semibold">Direction</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {directions.map(({ value, label }) => (
          <label key={value} className="relative">
            <input
              className="peer sr-only"
              type="radio"
              name={name}
              value={value}
              checked={selected === undefined ? undefined : selected === value}
              defaultChecked={
                selected === undefined ? value === 'IN' : undefined
              }
              onChange={() => onChange?.(value)}
            />
            <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-slate-100 px-3 font-semibold peer-checked:bg-emerald-800 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-700 peer-disabled:cursor-default peer-disabled:opacity-60">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
