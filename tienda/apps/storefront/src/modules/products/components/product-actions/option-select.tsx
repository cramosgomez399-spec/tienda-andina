import { compararTallas } from "@lib/util/talla"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  // Las tallas se muestran de menor a mayor; el resto de opciones mantiene el orden de la API.
  const filteredOptions = (option.values ?? [])
    .map((v) => v.value)
    .sort(compararTallas)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-semibold text-anil">
        Elige {title.toLowerCase()}
        {current && <span className="font-normal text-ui-fg-subtle">{`: ${current}`}</span>}
      </span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              aria-pressed={v === current}
              className={clx(
                "h-11 min-w-[3rem] flex-1 rounded-xl border-2 px-3 text-sm font-semibold transition-colors",
                {
                  "border-anil bg-anil text-white": v === current,
                  "border-ui-border-base bg-white text-anil hover:border-anil":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
