"use client"

import { BudgetSection } from "./components/BudgetSection"
import Header from "./components/Header"
import { LanguageToggle } from "./components/LanguageToggle"
import { NewSection } from "./components/NewSection"
import { RegisterSpentSection } from "./components/RegisterSpentSection"
import { ContractSection } from "./components/ContractSection"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { useBudget } from "@/lib/hooks/useBudget"
import { useLanguage } from "@/components/providers/LanguageProvider"


const Home = () => {
  const { language } = useLanguage()
  const { budget } = useBudget()

  return (
    <div className="bg-background min-h-screen ">
      <div className="flex flex-col items-center justify-center container mx-auto gap-2">

        <Header />
        <div className="flex justify-between items-center w-full space-y-4 px-3">
          <LanguageToggle />

          <p className="text-lg text-left font-semibold text-foreground" >{language === "es" ? "Tasa referencial: " : "Exchange rate: "}<span className="text-primary">{budget.exchange_rate ? budget.exchange_rate : "..."}</span></p>
        </div>
      </div>
      <div className="container mx-auto space-y-6 mb-10">

        <BudgetSection />


        <RegisterSpentSection />
        <ContractSection />
        <NewSection />

        <div className="flex justify-center w-full mt-8">
          <Button
            className="text-lg py-6 px-6 gap-2 cursor-pointer "
            onClick={() => window.open("https://photos.app.goo.gl/5Gu4PheyPtdTotNQ7", "_blank")}
          >
            <Camera className="size-5" />
            {language === "es" ? "Ver fotos del avance" : "View Progress Photos"}
          </Button>
        </div>      </div>
    </div>
  )
}

export default Home
