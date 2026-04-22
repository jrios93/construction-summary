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

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-center text-lg md:text-xl font-serif italic text-primary/90">
          <span className="text-2xl mr-2">"</span>
          {language === "es" ? "A Él sea gloria en la iglesia..." : "Unto Him Be Glory in the Church..."}
          < span className="text-2xl ml-2">"</span>
        </p>
        <p className="text-center text-sm md:text-base text-muted-foreground mt-1">
          {language === "es" ? "Efesios 3:21" : "Eph. 3:21"}
        </p>
      </div>
    </div >
  )
}

export default Header
