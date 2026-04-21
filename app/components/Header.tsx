import { useLanguage } from "@/components/providers/LanguageProvider"

const Header = () => {
  const { language } = useLanguage()

  return (
    <div className="  p-5 space-y-2">
      <h1 className="text-center text-2xl md:text-4xl text-foreground font-bold font-mono uppercase">
        {language === "es" ? "Primera Iglesia Bautista de Huancayo" : "First Baptist Church of Huancayo"}
      </h1>
      <p className="text-center text-lg md:text-2xl text-secondary-foreground font-sans font-semibold">
        {language === "es" ? "Acabados interiores del templo y aulas" : "Interior finishes of the temple and classrooms"}
      </p>
    </div>
  )
}

export default Header
