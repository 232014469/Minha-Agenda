/**
 * Casinha do gatinho no menu: telhado na cor do tema, porta em arco, um
 * coração no telhado e um tapetinho na frente. Desenho próprio, em SVG.
 */
export default function Casinha() {
  return (
    <svg
      className="casinha"
      viewBox="0 0 84 64"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className="casinha-tapete" cx="42" cy="60" rx="32" ry="4" />
      <rect
        className="casinha-parede"
        x="16"
        y="26"
        width="52"
        height="32"
        rx="3"
      />
      <path className="casinha-tabuas" d="M16 37h52M16 48h52" />
      <path className="casinha-telhado" d="M9 29 42 6l33 23Z" />
      <path
        className="casinha-coracao"
        d="M42 22c-3-2.6-6-4.6-6-7.2a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 2.6-3 4.6-6 7.2Z"
      />
      <path className="casinha-porta" d="M31 58V44a11 11 0 0 1 22 0v14Z" />
    </svg>
  )
}
