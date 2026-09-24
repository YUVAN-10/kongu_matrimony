import { useState, useRef } from 'react'
import { Trash2, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Mapping short abbreviation to full Tamil name for backward compatibility
const SHORT_TO_FULL = {
  'சூ': 'சூரியன்',
  'சந்': 'சந்திரன்',
  'செவ்': 'செவ்வாய்',
  'புத': 'புதன்',
  'குரு': 'குரு',
  'சுக்': 'சுக்கிரன்',
  'சனி': 'சனி',
  'ராகு': 'ராகு',
  'கேது': 'கேது',
  'லக்': 'லக்னம்',
}

// Full Tamil Names for Navagrahas + Lagnam
export const GRAHAS = [
  { id: 'suri', label: 'சூரியன்', name: 'சூரியன்', enName: 'Sun' },
  { id: 'chan', label: 'சந்திரன்', name: 'சந்திரன்', enName: 'Moon' },
  { id: 'sev', label: 'செவ்வாய்', name: 'செவ்வாய்', enName: 'Mars' },
  { id: 'budh', label: 'புதன்', name: 'புதன்', enName: 'Mercury' },
  { id: 'guru', label: 'குரு', name: 'குரு', enName: 'Jupiter' },
  { id: 'suk', label: 'சுக்கிரன்', name: 'சுக்கிரன்', enName: 'Venus' },
  { id: 'sani', label: 'சனி', name: 'சனி', enName: 'Saturn' },
  { id: 'rahu', label: 'ராகு', name: 'ராகு', enName: 'Rahu' },
  { id: 'kethu', label: 'கேது', name: 'கேது', enName: 'Ketu' },
  { id: 'lag', label: 'லக்னம்', name: 'லக்னம்', enName: 'Lagna' },
]

// Traditional 12 Tamil Rasi Houses with order and grid coordinates
// Standard South Indian 4x4 perimeter chart (12 outer boxes around a 2x2 center)
export const HOUSES = [
  { houseNum: 12, key: 'house12', name: 'மீனம்', enName: 'Pisces', row: 1, col: 1 },
  { houseNum: 1, key: 'house1', name: 'மேஷம்', enName: 'Aries', row: 1, col: 2 },
  { houseNum: 2, key: 'house2', name: 'ரிஷபம்', enName: 'Taurus', row: 1, col: 3 },
  { houseNum: 3, key: 'house3', name: 'மிதுனம்', enName: 'Gemini', row: 1, col: 4 },

  { houseNum: 11, key: 'house11', name: 'கும்பம்', enName: 'Aquarius', row: 2, col: 1 },
  { houseNum: 4, key: 'house4', name: 'கடகம்', enName: 'Cancer', row: 2, col: 4 },

  { houseNum: 10, key: 'house10', name: 'மகரம்', enName: 'Capricorn', row: 3, col: 1 },
  { houseNum: 5, key: 'house5', name: 'சிம்மம்', enName: 'Leo', row: 3, col: 4 },

  { houseNum: 9, key: 'house9', name: 'தனுசு', enName: 'Sagittarius', row: 4, col: 1 },
  { houseNum: 8, key: 'house8', name: 'விருச்சிகம்', enName: 'Scorpio', row: 4, col: 2 },
  { houseNum: 7, key: 'house7', name: 'துலாம்', enName: 'Libra', row: 4, col: 3 },
  { houseNum: 6, key: 'house6', name: 'கன்னி', enName: 'Virgo', row: 4, col: 4 },
]

/**
 * Normalizes input value from Firestore / form state into a standardized map:
 * { house1: ['சூரியன்'], house2: ['சந்திரன்', 'செவ்வாய்'], ... }
 */
function normalizeChartData(raw) {
  const result = {}
  for (let i = 1; i <= 12; i++) {
    result[`house${i}`] = []
  }

  if (!raw || typeof raw !== 'object') return result

  Object.entries(raw).forEach(([key, val]) => {
    let houseKey = key
    if (/^\d+$/.test(key)) {
      const num = parseInt(key, 10)
      if (num >= 0 && num <= 11) {
        houseKey = `house${num + 1}`
      } else if (num >= 1 && num <= 12) {
        houseKey = `house${num}`
      }
    }

    if (result[houseKey] !== undefined) {
      let items = []
      if (Array.isArray(val)) {
        items = val.filter(Boolean)
      } else if (typeof val === 'string' && val.trim()) {
        items = val.split(',').map((s) => s.trim()).filter(Boolean)
      }
      // Expand any short abbreviations to full names
      result[houseKey] = items.map((item) => SHORT_TO_FULL[item] || item)
    }
  })

  return result
}

/**
 * Serializes internal chart state back into the format:
 * { house1: "சூரியன்", house2: "சந்திரன், செவ்வாய்", ... }
 */
function serializeChartData(data) {
  const serialized = {}
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}`
    const items = data[key] || []
    serialized[key] = items.join(', ')
  }
  return serialized
}

export default function HoroscopeChart({
  value = {},
  onChange,
  readOnly = false,
  title = 'இராசி',
  allowMultiplePerBox = true,
}) {
  const chartData = normalizeChartData(value)
  const [selectedGraha, setSelectedGraha] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null) // { label, fromHouse: string | null }
  const [hoveredHouse, setHoveredHouse] = useState(null)
  const touchSourceRef = useRef(null)

  // Find all grahas currently placed anywhere in the chart
  const placedGrahas = new Set()
  Object.values(chartData).forEach((items) => {
    items.forEach((g) => placedGrahas.add(g))
  })

  function emitChange(newData) {
    if (onChange && !readOnly) {
      onChange(serializeChartData(newData))
    }
  }

  function handleAddGrahaToHouse(houseKey, grahaLabel, sourceHouseKey = null) {
    if (readOnly || !grahaLabel || !houseKey) return

    const normalizedLabel = SHORT_TO_FULL[grahaLabel] || grahaLabel
    const updated = { ...chartData }

    // If moved from another house, remove from that house
    if (sourceHouseKey && sourceHouseKey !== houseKey) {
      updated[sourceHouseKey] = (updated[sourceHouseKey] || []).filter((g) => g !== normalizedLabel)
    } else if (!sourceHouseKey) {
      // Prevent duplicates in different boxes: remove from existing house if present
      Object.keys(updated).forEach((hKey) => {
        if (hKey !== houseKey) {
          updated[hKey] = (updated[hKey] || []).filter((g) => g !== normalizedLabel)
        }
      })
    }

    const currentHouseItems = updated[houseKey] || []

    if (!allowMultiplePerBox) {
      // Single planet per box mode -> replace or swap
      if (currentHouseItems.length > 0 && sourceHouseKey && sourceHouseKey !== houseKey) {
        const displaced = currentHouseItems[0]
        updated[sourceHouseKey] = [displaced]
      }
      updated[houseKey] = [normalizedLabel]
    } else {
      // Multiple allowed -> add if not already in this box
      if (!currentHouseItems.includes(normalizedLabel)) {
        updated[houseKey] = [...currentHouseItems, normalizedLabel]
      }
    }

    emitChange(updated)
    setSelectedGraha(null)
    setDraggedItem(null)
    setHoveredHouse(null)
  }

  function handleRemoveGraha(houseKey, grahaLabel, e) {
    if (e) e.stopPropagation()
    if (readOnly) return

    const normalizedLabel = SHORT_TO_FULL[grahaLabel] || grahaLabel
    const updated = {
      ...chartData,
      [houseKey]: (chartData[houseKey] || []).filter((g) => g !== normalizedLabel),
    }
    emitChange(updated)
    if (selectedGraha === normalizedLabel) setSelectedGraha(null)
  }

  function handleClearChart() {
    if (readOnly) return
    const cleared = {}
    for (let i = 1; i <= 12; i++) {
      cleared[`house${i}`] = []
    }
    emitChange(cleared)
    setSelectedGraha(null)
    setDraggedItem(null)
    setHoveredHouse(null)
  }

  // --- Drag & Drop Handlers ---
  function handleDragStart(e, grahaLabel, sourceHouseKey = null) {
    if (readOnly) return
    const normalizedLabel = SHORT_TO_FULL[grahaLabel] || grahaLabel
    const itemData = { label: normalizedLabel, fromHouse: sourceHouseKey }
    setDraggedItem(itemData)
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(itemData))
      e.dataTransfer.setData('text/plain', normalizedLabel)
      e.dataTransfer.effectAllowed = 'move'
    } catch {}
  }

  function handleDragOver(e, houseKey) {
    if (readOnly) return
    e.preventDefault()
    try {
      e.dataTransfer.dropEffect = 'move'
    } catch {}
    if (hoveredHouse !== houseKey) {
      setHoveredHouse(houseKey)
    }
  }

  function handleDragLeave(e, houseKey) {
    if (readOnly) return
    if (hoveredHouse === houseKey) {
      setHoveredHouse(null)
    }
  }

  function handleDrop(e, houseKey) {
    if (readOnly) return
    e.preventDefault()
    setHoveredHouse(null)

    let grahaLabel = null
    let sourceHouse = null

    try {
      const rawJson = e.dataTransfer.getData('application/json')
      if (rawJson) {
        const parsed = JSON.parse(rawJson)
        grahaLabel = parsed.label
        sourceHouse = parsed.fromHouse
      }
    } catch {}

    if (!grahaLabel) {
      try {
        grahaLabel = e.dataTransfer.getData('text/plain')
      } catch {}
    }

    if (!grahaLabel && draggedItem) {
      grahaLabel = draggedItem.label
      sourceHouse = draggedItem.fromHouse
    }

    if (!grahaLabel && selectedGraha) {
      grahaLabel = selectedGraha
    }

    if (grahaLabel) {
      handleAddGrahaToHouse(houseKey, grahaLabel, sourceHouse)
    }
  }

  function handleHouseClick(houseKey) {
    if (readOnly) return
    if (selectedGraha) {
      handleAddGrahaToHouse(houseKey, selectedGraha, null)
    }
  }

  // Touch support helpers
  function handleTouchStartGraha(grahaLabel, sourceHouse = null) {
    if (readOnly) return
    const normalizedLabel = SHORT_TO_FULL[grahaLabel] || grahaLabel
    touchSourceRef.current = { label: normalizedLabel, fromHouse: sourceHouse }
    setSelectedGraha((prev) => (prev === normalizedLabel ? null : normalizedLabel))
  }

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-2xl mx-auto my-2 select-none">
      {/* Top Section: Draggable Planet Chips Card */}
      {!readOnly && (
        <div className="w-full rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-border/60 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span className="tamil-text">கிரகங்கள் (Draggable Planets):</span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Drag or tap a planet, then click any box below
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {GRAHAS.map((g) => {
              const isSelected = selectedGraha === g.label
              const isPlaced = placedGrahas.has(g.label)
              const isDragging = draggedItem?.label === g.label

              return (
                <div
                  key={g.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, g.label, null)}
                  onDragEnd={() => {
                    setDraggedItem(null)
                    setHoveredHouse(null)
                  }}
                  onClick={() => handleTouchStartGraha(g.label, null)}
                  title={`${g.name} (${g.enName})`}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'group relative inline-flex items-center justify-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-grab active:cursor-grabbing',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/40 shadow-md scale-105'
                      : isPlaced
                      ? 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10'
                      : 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-accent hover:text-foreground hover:scale-102',
                    isDragging && 'opacity-40 border-dashed border-primary scale-95'
                  )}
                >
                  <span className="tamil-text font-extrabold">{g.label}</span>
                  <span className="text-[10px] font-normal opacity-70 group-hover:opacity-100 hidden md:inline">
                    {g.enName}
                  </span>
                  {isPlaced && (
                    <span className="size-1.5 rounded-full bg-primary" title="Placed in chart" />
                  )}
                </div>
              )
            })}
          </div>

          {selectedGraha && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-1.5 text-xs text-primary animate-in fade-in duration-200">
              <span>
                Selected: <strong className="tamil-text">{selectedGraha}</strong>. Tap any house box to place it.
              </span>
              <button
                type="button"
                onClick={() => setSelectedGraha(null)}
                className="text-xs font-semibold underline hover:text-primary/80"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Traditional 12-House Tamil Horoscope Grid (4x4 perimeter) */}
      <div className="relative aspect-square w-full rounded-2xl border-2 border-foreground/80 bg-card p-1.5 shadow-md overflow-hidden">
        <div className="grid grid-cols-4 grid-rows-4 h-full w-full gap-1">
          {HOUSES.map((house) => {
            const items = chartData[house.key] || []
            const isHovered = hoveredHouse === house.key
            const isOccupied = items.length > 0

            return (
              <div
                key={house.key}
                style={{ gridRow: house.row, gridColumn: house.col }}
                onDragOver={(e) => handleDragOver(e, house.key)}
                onDragEnter={(e) => handleDragOver(e, house.key)}
                onDragLeave={(e) => handleDragLeave(e, house.key)}
                onDrop={(e) => handleDrop(e, house.key)}
                onClick={() => handleHouseClick(house.key)}
                className={cn(
                  'relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all border text-center select-none min-h-[75px]',
                  isHovered
                    ? 'border-primary bg-primary/15 ring-2 ring-primary/50 shadow-inner scale-[0.98]'
                    : isOccupied
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/40',
                  !readOnly && 'cursor-pointer',
                  selectedGraha && !readOnly && 'ring-1 ring-primary/30'
                )}
              >
                {/* House Sign Name */}
                {house.name && (
                  <span className="tamil-text absolute top-1 left-1.5 text-[10px] font-semibold text-muted-foreground/75 pointer-events-none truncate max-w-[85%]">
                    {house.name}
                  </span>
                )}

                {/* Placed Planet Chips inside this house */}
                <div className="flex flex-wrap items-center justify-center gap-1 mt-2.5 w-full">
                  {items.map((grahaLabel, idx) => (
                    <span
                      key={`${grahaLabel}-${idx}`}
                      draggable={!readOnly}
                      onDragStart={(e) => handleDragStart(e, grahaLabel, house.key)}
                      onDragEnd={() => {
                        setDraggedItem(null)
                        setHoveredHouse(null)
                      }}
                      className={cn(
                        'tamil-text inline-flex items-center gap-1 rounded-full border border-primary/60 bg-card px-2 py-0.5 text-[11px] font-bold text-primary shadow-xs transition-transform',
                        !readOnly && 'hover:scale-105 hover:bg-destructive/10 hover:border-destructive hover:text-destructive group cursor-grab'
                      )}
                    >
                      <span className="tamil-text">{grahaLabel}</span>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveGraha(house.key, grahaLabel, e)}
                          title="Remove planet"
                          className="size-3 rounded-full flex items-center justify-center text-muted-foreground group-hover:text-destructive hover:bg-destructive/20 ml-0.5"
                        >
                          <X className="size-2.5" />
                        </button>
                      )}
                    </span>
                  ))}

                  {items.length === 0 && !readOnly && isHovered && (
                    <span className="text-[11px] font-medium text-primary animate-pulse">
                      Drop here
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Center 2x2 Header Display */}
          <div
            style={{ gridRow: '2 / span 2', gridColumn: '2 / span 2' }}
            className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-muted/40 p-3 text-center select-none shadow-inner"
          >
            <span className="tamil-text text-xl sm:text-2xl font-black tracking-wider text-primary">
              {title}
            </span>
            <span className="tamil-text text-xs font-semibold text-muted-foreground mt-0.5">
              கட்டம் (Chart)
            </span>
            {!readOnly && placedGrahas.size > 0 && (
              <span className="tamil-text mt-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                {placedGrahas.size} கிரகங்கள்
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer (Clear Chart) */}
      {!readOnly && (
        <div className="flex items-center justify-center w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearChart}
            disabled={placedGrahas.size === 0}
            className="rounded-full border-border bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors shadow-xs"
          >
            <Trash2 className="mr-1.5 size-3.5" />
            <span className="tamil-text">நீக்கவும் (Clear Chart)</span>
          </Button>
        </div>
      )}
    </div>
  )
}
