import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ComponentProps } from "react"

// Optional: export this if you want name autocomplete elsewhere
export type IconName = keyof typeof Icons

function resolveIcon(name?: string): LucideIcon {
  const fallback = Icons.Settings as LucideIcon
  if (!name) return fallback

  const key = name.trim()
  // Access dynamically but avoid the bad cast error by going through `unknown`
  const candidate = (Icons as unknown as Record<string, unknown>)[key]

  // Runtime guard: ensure we return a React component-like value
  if (typeof candidate === "function") {
    return candidate as LucideIcon
  }
  // Some builds expose forwardRef objects with a .render function
  if (candidate && typeof (candidate as any).render === "function") {
    return candidate as LucideIcon
  }

  return fallback
}

export function DynamicIcon({
  name,
  ...props
}: { name?: string } & ComponentProps<LucideIcon>) {
  const Icon = resolveIcon(name)
  return <Icon {...props} />
}
