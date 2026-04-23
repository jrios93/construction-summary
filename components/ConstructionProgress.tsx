"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Check, ChevronUp, ChevronDown, GripVertical } from "lucide-react"

interface Milestone {
  id: string
  label: string
  threshold: number
}

interface ConstructionProgressProps {
  progress?: number
  milestones?: Milestone[]
  onSave?: (progress: number, milestones: Milestone[]) => void
  mode?: "public" | "admin"
  loading?: boolean
}

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", label: "Planificación", threshold: 10 },
  { id: "2", label: "Cimentación", threshold: 25 },
  { id: "3", label: "Estructura", threshold: 50 },
  { id: "4", label: "Acabados", threshold: 75 },
  { id: "5", label: "Entrega final", threshold: 95 },
]

function ConstructionProgressPublic({
  progress = 0,
  milestones = DEFAULT_MILESTONES,
  loading = false,
}: Pick<ConstructionProgressProps, "progress" | "milestones" | "loading">) {
  const [animatedProgress, setAnimatedProgress] = React.useState(0)

  React.useEffect(() => {
    if (loading) {
      setAnimatedProgress(0)
      return
    }
    const timer = setTimeout(() => setAnimatedProgress(progress), 100)
    return () => clearTimeout(timer)
  }, [progress, loading])

  const sortedMilestones = [...milestones].sort((a, b) => a.threshold - b.threshold)

  return (
    <Card className="w-full">
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="text-center">
          {loading ? (
            <span className="text-6xl md:text-8xl font-bold text-muted animate-pulse">...</span>
          ) : (
            <>
              <span className="text-6xl md:text-8xl font-bold text-[var(--progress)]">{animatedProgress}</span>
              <span className="text-4xl md:text-5xl text-[var(--progress)]">%</span>
            </>
          )}
        </div>

        {/* Mobile: Vertical Timeline Layout (de abajo hacia arriba) */}
        <div className="md:hidden">
          <div className="flex gap-4">
            {/* Barra vertical */}
            <div className="relative w-8 flex-shrink-0" style={{ height: `${sortedMilestones.length * 64}px` }}>
              <div className="absolute inset-x-0 top-2 bottom-2 w-2 bg-muted rounded-full" />
              <div
                className="absolute inset-x-0 bottom-2 w-2 bg-[var(--progress)] rounded-full transition-all duration-1000 ease-out"
                style={{ height: `${animatedProgress}%` }}
              />
            </div>

            {/* Lista de hitos (de abajo hacia arriba usando flex-col-reverse) */}
            <div className="flex-1 space-y-3 flex flex-col-reverse" style={{ minHeight: `${sortedMilestones.length * 64}px` }}>
              {sortedMilestones.map((milestone) => {
                const isActive = progress >= milestone.threshold

                return (
                  <div key={milestone.id} className="flex items-start gap-3">
                    {/* Indicador circular */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                        isActive
                          ? "bg-[var(--progress)] text-background border-[var(--progress)]"
                          : "bg-background text-muted-foreground border-muted"
                      )}>
                        {isActive ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{sortedMilestones.findIndex(m => m.id === milestone.id) + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Info del hito */}
                    <div className="flex-1 min-h-[2rem] flex items-center">
                      <div className="space-y-0.5">
                        <span className={cn(
                          "text-lg font-semibold block",
                          isActive ? "text-[var(--progress)]" : "text-muted-foreground"
                        )}>
                          {milestone.label}
                        </span>
                        <span className={cn(
                          "text-base",
                          isActive ? "text-[var(--progress)]" : "text-muted-foreground"
                        )}>
                          {milestone.threshold}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:block space-y-3">
          <div className="relative h-10 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--progress)] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedProgress}%` }}
            />
            {sortedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="absolute top-0 bottom-0 w-1 bg-background/50"
                style={{ left: `${milestone.threshold}%` }}
              />
            ))}
          </div>

          <div className="flex justify-between">
            {sortedMilestones.map((milestone) => {
              const isActive = progress >= milestone.threshold
              return (
                <div key={milestone.id} className="flex flex-col items-center gap-1 flex-1">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    isActive ? "bg-[var(--progress)] text-background" : "bg-muted text-muted-foreground"
                  )}>
                    {isActive && <Check className="w-3 h-3" />}
                  </div>
                  <span className={cn(
                    "text-center text-base font-medium",
                    isActive ? "text-[var(--progress)]" : "text-muted-foreground"
                  )}>
                    {milestone.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConstructionProgressAdmin({
  progress: initialProgress = 42,
  milestones: initialMilestones = DEFAULT_MILESTONES,
  onSave,
}: ConstructionProgressProps) {
  const [localProgress, setLocalProgress] = React.useState(initialProgress)
  const [milestones, setMilestones] = React.useState<Milestone[]>(initialMilestones)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [newLabel, setNewLabel] = React.useState("")
  const [newThreshold, setNewThreshold] = React.useState("")

  React.useEffect(() => {
    setLocalProgress(initialProgress)
    setMilestones(initialMilestones)
  }, [initialProgress, initialMilestones])

  const handleAddMilestone = () => {
    if (!newLabel.trim()) return
    const threshold = parseInt(newThreshold) || 0
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      threshold: Math.min(Math.max(threshold, 0), 100),
    }
    setMilestones((prev) => [...prev, newMilestone].sort((a, b) => a.threshold - b.threshold))
    setNewLabel("")
    setNewThreshold("")
  }

  const handleDeleteMilestone = (id: string) => setMilestones((prev) => prev.filter((m) => m.id !== id))
  const handleUpdateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }
  const handleMoveMilestone = (id: string, direction: "up" | "down") => {
    setMilestones((prev) => {
      const sorted = [...prev].sort((a, b) => a.threshold - b.threshold)
      const index = sorted.findIndex((m) => m.id === id)
      if (index === -1) return prev

      let targetThreshold: number
      if (direction === "up" && index > 0) {
        targetThreshold = sorted[index - 1].threshold - 1
      } else if (direction === "down" && index < sorted.length - 1) {
        targetThreshold = sorted[index + 1].threshold + 1
      } else {
        return prev
      }

      targetThreshold = Math.max(0, Math.min(100, targetThreshold))

      return prev.map((m) =>
        m.id === id ? { ...m, threshold: targetThreshold } : m
      )
    })
  }
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("milestoneId", id)
    e.dataTransfer.effectAllowed = "move"
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData("milestoneId")
    if (draggedId === targetId) return

    setMilestones((prev) => {
      const updated = [...prev]
      const draggedIndex = updated.findIndex((m) => m.id === draggedId)
      const targetIndex = updated.findIndex((m) => m.id === targetId)
      if (draggedIndex === -1 || targetIndex === -1) return prev

      const [dragged] = updated.splice(draggedIndex, 1)
      updated.splice(targetIndex, 0, dragged)

      return updated.map((m, i) => ({ ...m, threshold: (i + 1) * Math.floor(100 / updated.length) }))
    })
  }
  const handleSave = () => onSave?.(localProgress, milestones)

  return (
    <div className="space-y-6">
      <Card className="text-xl">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Project Execution Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="text-xl font-bold w-28">Progreso:</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={localProgress}
                onChange={(e) => setLocalProgress(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100))}
                className="w-24 h-12 text-xl text-center"
              />
              <span className="text-xl font-bold">%</span>
            </div>
            <SliderPrimitive.Root
              className="relative flex items-center w-full h-8 select-none touch-none"
              value={[localProgress]}
              onValueChange={([v]) => setLocalProgress(v)}
              max={100}
              step={1}
            >
              <SliderPrimitive.Track className="relative h-3 w-full grow rounded-full bg-muted">
                <SliderPrimitive.Range className="absolute h-full bg-[var(--progress)] rounded-full" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className="block w-6 h-6 rounded-full bg-[var(--progress)] shadow-lg" />
            </SliderPrimitive.Root>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-bold">Hitos</h4>
            <div className="space-y-2">
              {[...milestones].sort((a, b) => a.threshold - b.threshold).map((milestone) => (
                <div
                  key={milestone.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, milestone.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, milestone.id)}
                  className="flex items-center gap-2 p-3 border rounded-lg text-lg cursor-grab active:cursor-grabbing hover:bg-accent/20 transition-colors"
                >
                  {editingId === milestone.id ? (
                    <>
                      <Input
                        value={milestone.label}
                        onChange={(e) => handleUpdateMilestone(milestone.id, { label: e.target.value })}
                        className="flex-1 h-10 text-lg"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={milestone.threshold}
                        onChange={(e) => handleUpdateMilestone(milestone.id, { threshold: parseInt(e.target.value) || 0 })}
                        className="w-20 h-10 text-lg text-center"
                      />
                      <Button size="icon-lg" onClick={() => setEditingId(null)}>
                        <Check className="size-5" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex w-full flex-col lg:flex-row lg:items-center lg:gap-2 gap-2">

                      <div className="flex items-center gap-2">
                        <GripVertical className="size-5 text-muted-foreground" />
                        <div className={cn("w-3 h-3 rounded-full", localProgress >= milestone.threshold ? "bg-[var(--progress)]" : "bg-muted")} />
                        <span className="text-lg font-medium">{milestone.label}</span>
                        <span className="text-base text-muted-foreground">({milestone.threshold}%)</span>
                      </div>
                      <div className="flex gap-1 ml-auto">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleMoveMilestone(milestone.id, "up")} title="Subir">
                          <ChevronUp className="size-10" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => handleMoveMilestone(milestone.id, "down")} title="Bajar">
                          <ChevronDown className="size-10" />
                        </Button>
                      </div>
                      <Button variant="outline" onClick={() => setEditingId(milestone.id)} className="h-10 text-lg">
                        Editar
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteMilestone(milestone.id)} className="h-10">
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-end gap-2 p-3 border rounded-lg">
              <div className="flex-1 space-y-1">
                <label className="text-base font-medium">Nuevo hito:</label>
                <Input
                  placeholder="Nombre"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="h-10 text-lg"
                />
              </div>
              <div className="w-20 space-y-1">
                <label className="text-base font-medium">%:</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0-100"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="h-10 text-lg text-center"
                />
              </div>
              <Button onClick={handleAddMilestone} size="icon-lg" className="h-10">
                <Plus className="size-5" />
              </Button>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full h-12 text-xl bg-[var(--progress)] hover:bg-[var(--progress)]/90 font-bold">
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      <ConstructionProgressPublic progress={localProgress} milestones={milestones} />
    </div>
  )
}

export function ConstructionProgress(props: ConstructionProgressProps) {
  if (props.mode === "admin") return <ConstructionProgressAdmin {...props} />
  return <ConstructionProgressPublic {...props} />
}

export { DEFAULT_MILESTONES }
