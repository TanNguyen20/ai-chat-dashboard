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

const AVAILABLE_ICONS = [
  "Home",
  "User",
  "Users",
  "Settings",
  "Search",
  "Bell",
  "Mail",
  "Calendar",
  "Clock",
  "Heart",
  "Star",
  "Bookmark",
  "Tag",
  "File",
  "FileText",
  "Folder",
  "FolderOpen",
  "Image",
  "Video",
  "Music",
  "Download",
  "Upload",
  "Trash",
  "Edit",
  "Copy",
  "Check",
  "X",
  "Plus",
  "Minus",
  "ChevronRight",
  "ChevronLeft",
  "ChevronUp",
  "ChevronDown",
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "Menu",
  "MoreVertical",
  "MoreHorizontal",
  "Grid",
  "List",
  "Layout",
  "Layers",
  "Lock",
  "Unlock",
  "Eye",
  "EyeOff",
  "Shield",
  "Key",
  "LogIn",
  "LogOut",
  "UserPlus",
  "UserMinus",
  "UserCheck",
  "UserX",
  "AlertCircle",
  "AlertTriangle",
  "Info",
  "HelpCircle",
  "CheckCircle",
  "XCircle",
  "Zap",
  "Activity",
  "TrendingUp",
  "TrendingDown",
  "BarChart",
  "PieChart",
  "DollarSign",
  "CreditCard",
  "ShoppingCart",
  "ShoppingBag",
  "Package",
  "Truck",
  "MapPin",
  "Map",
  "Navigation",
  "Compass",
  "Phone",
  "MessageSquare",
  "MessageCircle",
  "Send",
  "Inbox",
  "Archive",
  "Paperclip",
  "Link",
  "ExternalLink",
  "Share",
  "Share2",
  "Printer",
  "Save",
  "RefreshCw",
  "RotateCw",
  "RotateCcw",
  "Repeat",
  "Shuffle",
  "Play",
  "Pause",
  "Square",
  "Circle",
  "Triangle",
  "Hexagon",
  "Award",
  "Gift",
  "Coffee",
  "Briefcase",
  "Building",
  "Building2",
  "Store",
  "Warehouse",
  "Factory",
  "Cpu",
  "HardDrive",
  "Server",
  "Database",
  "Cloud",
  "CloudOff",
  "Wifi",
  "WifiOff",
  "Bluetooth",
  "Cast",
  "Monitor",
  "Smartphone",
  "Tablet",
  "Watch",
  "Laptop",
  "Keyboard",
  "Mouse",
  "Printer",
  "Camera",
  "Mic",
  "MicOff",
  "Volume",
  "Volume1",
  "Volume2",
  "VolumeX",
  "Battery",
  "BatteryCharging",
  "Power",
  "Plug",
  "Zap",
  "Sun",
  "Moon",
  "CloudRain",
  "CloudSnow",
  "Wind",
  "Droplet",
  "Flame",
  "Thermometer",
  "Umbrella",
  "Glasses",
  "Shirt",
  "Watch",
  "Crown",
  "Gem",
  "Palette",
  "Brush",
  "Pencil",
  "PenTool",
  "Feather",
  "Type",
  "Bold",
  "Italic",
  "Underline",
  "AlignLeft",
  "AlignCenter",
  "AlignRight",
  "AlignJustify",
  "Code",
  "Terminal",
  "GitBranch",
  "GitCommit",
  "GitMerge",
  "GitPullRequest",
  "Github",
  "Gitlab",
  "Chrome",
  "Figma",
  "Slack",
  "Twitter",
  "Facebook",
  "Instagram",
  "Linkedin",
  "Youtube",
  "Twitch",
  "Globe",
  "Flag",
  "Target",
  "Filter",
  "Sliders",
  "ToggleLeft",
  "ToggleRight",
  "Maximize",
  "Minimize",
  "ZoomIn",
  "ZoomOut",
  "Expand",
  "Shrink",
  "Move",
  "Crosshair",
  "Aperture",
  "Focus",
  "Scan",
] as const

export function IconPicker({ value, onSelect, label = "Icon" }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return AVAILABLE_ICONS
    return AVAILABLE_ICONS.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
  }, [search])

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
