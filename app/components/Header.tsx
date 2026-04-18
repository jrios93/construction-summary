const Header = () => {
  return (
    <div className="  p-5 space-y-2">
      <h1 className="text-center text-2xl md:text-4xl text-foreground font-bold font-mono uppercase">
        <span className="hidden md:inline">Primera Iglesia Bautista de Huancayo</span>
        <span className="md:hidden font-serif">PIB - Huancayo</span>
      </h1>
      <p className="text-center text-lg md:text-2xl text-secondary-foreground font-sans font-semibold">Construcción del templo</p>
    </div>
  )
}

export default Header
