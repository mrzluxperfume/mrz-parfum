import { topBarMessages } from '../../data/brand'

/** Duplicate the strip so the CSS loop stays seamless. */
const tickerItems = [...topBarMessages, ...topBarMessages, ...topBarMessages]

export default function TopBar() {
  return (
    <div className="border-b border-ink/5 bg-ink text-white">
      <div className="relative h-[42px] overflow-hidden md:h-[52px]">
        <div className="topbar-marquee absolute inset-y-0 flex items-center whitespace-nowrap">
          {tickerItems.map((message, i) => (
            <span
              key={`${message}-${i}`}
              className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] md:text-[11px]"
            >
              <span className="px-8 md:px-12">{message}</span>
              <span className="opacity-50" aria-hidden>
                ·
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
