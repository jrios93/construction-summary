"use client"

import { BudgetSection } from "./components/BudgetSection"
import Header from "./components/Header"
import { LanguageToggle } from "./components/LanguageToggle"
import { NewSection } from "./components/NewSection"
import { RegisterSpentSection } from "./components/RegisterSpentSection"
import { ContractSection } from "./components/ContractSection"
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

          <p className="text-xl text-left font-semibold text-foreground" >{language === "es" ? "Tasa referencial: " : "Exchange rate: "}<span className="text-primary">{budget.exchange_rate ? budget.exchange_rate : "..."}</span></p>
        </div>
      </div>
      <div className="container mx-auto space-y-6 mb-10">

        <BudgetSection />
        <RegisterSpentSection />
        <ContractSection />
        <NewSection />
      </div>
    </div>
  )
}

export default Home
