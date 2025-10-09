"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import * as Lucide from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface IconPickerProps {
  readonly value?: string
  readonly onSelect: (iconName: string) => void
  readonly label?: string
}

export function IconPicker({ value, onSelect, label = "Icon" }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Build a stable Record<string, LucideIcon> from the module.
  // Prefer the "icons" export if present, else fall back to filtering module exports.
  const ICONS: Record<string, LucideIcon> = useMemo(() => {
    const m = Lucide as unknown as { icons?: Record<string, LucideIcon> } & Record<string, any>
    if (m.icons && typeof m.icons === "object") {
      return m.icons
    }
    // Fallback for older lucide-react versions
    const entries = Object.entries(m).filter(([k, v]) => {
      return /^[A-Z]/.test(k) && k !== "createLucideIcon" && typeof v === "function"
    }) as Array<[string, LucideIcon]>
    return Object.fromEntries(entries)
  }, [])

  const ALL_ICON_NAMES = useMemo<string[]>(() => {
    return Object.keys(ICONS).sort()
  }, [ICONS])

  const filteredIcons = useMemo<string[]>(() => {
    const base = ALL_ICON_NAMES
    if (!search) return base
    const q = search.toLowerCase()
    return base.filter((name) => name.toLowerCase().includes(q))
  }, [search, ALL_ICON_NAMES])

  const SelectedIcon =
    (value && ICONS[value]) || ICONS.FileQuestion || (Lucide.FileQuestion as LucideIcon | undefined)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            {SelectedIcon ? <SelectedIcon className="h-4 w-4" /> : null}
            <span>{value || "Select an icon"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>

          <div
            className="max-h-72 overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-6 gap-2 p-2">
              {(filteredIcons ?? []).map((iconName) => {
                const IconComponent = ICONS[iconName]
                if (!IconComponent) return null
                return (
                  <Button
                    key={iconName}
                    variant={value === iconName ? "default" : "ghost"}
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={() => {
                      onSelect(iconName)
                      setOpen(false)
                      setSearch("")
                    }}
                    title={iconName}
                    aria-label={`Choose ${iconName} icon`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="p-2 border-t text-xs text-muted-foreground text-center">
            {filteredIcons.length} icons shown
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
