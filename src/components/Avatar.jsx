function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2) //E merr shkronjen e pare dhe te fundit 
  }
  return name.slice(0, 2).toUpperCase()
}

export default function Avatar({ name, size = 40, className = '' }) {
  const initials = getInitials(name)
  const sizeNum = Number(size) || 40

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: sizeNum,
        height: sizeNum,
        minWidth: sizeNum,
        minHeight: sizeNum,
        fontSize: sizeNum * 0.4, //Nese avatar eshte: 40px, font-size dot jete 16px
      }}
      aria-hidden
    >
      {initials}
    </div>
  )
}
