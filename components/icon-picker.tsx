"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface IconPickerProps {
  value?: string
  onSelect: (iconName: string) => void
  label?: string
}

export function IconPicker({ value, onSelect, label = "Icon" }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Get all lucide icons
  const allIcons = useMemo(() => {
    return Object.keys(Icons).filter(
      (key) =>
        key !== "createLucideIcon" && key !== "default" && typeof Icons[key as keyof typeof Icons] === "function",
    )
  }, [])

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return allIcons.slice(0, 100) // Show first 100 by default
    return allIcons.filter((name) => name.toLowerCase().includes(search.toLowerCase())).slice(0, 100)
  }, [search, allIcons])

  const SelectedIcon = value ? (Icons[value as keyof typeof Icons] as LucideIcon) : Icons.FileQuestion

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <SelectedIcon className="h-4 w-4" />
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
          <ScrollArea className="h-72">
            <div className="grid grid-cols-6 gap-2 p-2">
              {filteredIcons.map((iconName) => {
                const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon
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
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
          <div className="p-2 border-t text-xs text-muted-foreground text-center">
            {filteredIcons.length} icons shown
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
