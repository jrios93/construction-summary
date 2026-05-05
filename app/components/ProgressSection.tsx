"use client"

import { useProgress } from "@/lib/hooks/useProgress"
import { ConstructionProgress } from "@/components/ConstructionProgress"
import { useLanguage } from "@/components/providers/LanguageProvider"

export function ProgressSection() {
  const { data: progressData, loading: progressLoading } = useProgress()
  const { t } = useLanguage()

  return (
    <>
      <div className="flex items-center gap-16">
        <div className="w-fit">
          <h2 className="text-3xl font-semibold text-nowrap">{t.home.progressTitle}</h2>
        </div>
        <div className="border border-neutral-300 w-full"></div>
      </div>

      <ConstructionProgress
        mode="public"
        progress={progressLoading ? 0 : (progressData?.progress ?? 0)}
        milestones={progressLoading ? undefined : (progressData?.milestones ?? undefined)}
      />
    </>
  )
}
