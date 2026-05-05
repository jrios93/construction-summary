"use client"

import { Suspense } from "react"
import { BudgetSection } from "./components/BudgetSection"
import Header from "./components/Header"
import { LanguageToggle } from "./components/LanguageToggle"
import { NewSection } from "./components/NewSection"
import { RegisterSpentSection } from "./components/RegisterSpentSection"
import { ContractSection } from "./components/ContractSection"
import { ExchangeRateDisplay } from "./components/ExchangeRateDisplay"
import { ProgressSection } from "./components/ProgressSection"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"

function SectionSkeleton() {
  return <div className="p-6 bg-card rounded-lg animate-pulse h-40"></div>
}

const Home = () => {
  const { language, t } = useLanguage()

  return (
    <div className="bg-background min-h-screen ">
      <div className="flex flex-col items-center justify-center container mx-auto gap-2">
        <Header />
        <div className="flex justify-between items-center w-full space-y-4 px-3">
          <LanguageToggle />
          <Suspense fallback={<div className="h-7 w-32 bg-muted animate-pulse rounded"></div>}>
            <ExchangeRateDisplay />
          </Suspense>
        </div>
      </div>
      <div className="container mx-auto space-y-6 mb-10">

        <Suspense fallback={<SectionSkeleton />}>
          <BudgetSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ProgressSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <RegisterSpentSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <ContractSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <NewSection />
        </Suspense>

        <div className="flex justify-center w-full mt-8">
          <Button
            className="text-lg py-6 px-6 gap-2 cursor-pointer "
            onClick={() => window.open("https://photos.app.goo.gl/5Gu4PheyPtdTotNQ7", "_blank")}
          >
            <Camera className="size-5" />
            {language === "es" ? "Ver fotos del avance" : "View Progress Photos"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home
