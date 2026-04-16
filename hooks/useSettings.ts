import { useAppStore } from "@/store/app-store"

export function useSettings() {
  const { settings, updateSettings } = useAppStore()

  const toggleAnimations = () => {
    updateSettings({ animationsEnabled: !settings.animationsEnabled })
  }

  const setDisplayName = (name: string) => {
    updateSettings({ displayName: name })
  }

  const setTheme = (theme: "dark" | "auto") => {
    updateSettings({ theme })
  }

  return {
    settings,
    updateSettings,
    toggleAnimations,
    setDisplayName,
    setTheme,
  }
}
