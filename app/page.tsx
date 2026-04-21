"use client"

import { BudgetSection } from "./components/BudgetSection"
import Header from "./components/Header"
import { LanguageToggle } from "./components/LanguageToggle"
import { NewSection } from "./components/NewSection"
import { RegisterSpentSection } from "./components/RegisterSpentSection"
import { ContractSection } from "./components/ContractSection"


const Home = () => {


  return (
    <div className="bg-background min-h-screen ">
      <div className="flex flex-col items-center justify-center w-full gap-2">

        <Header />
        <LanguageToggle />
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
