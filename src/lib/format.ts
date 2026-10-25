import { storeConfig } from '../config/store'

const wholeNaira = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })
const nairaWithKobo = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats a naira amount, dropping kobo when the amount is whole: ₦18,500 or ₦99.50. */
export function formatNaira(amount: number): string {
  const formatter = Number.isInteger(amount) ? wholeNaira : nairaWithKobo
  return `${storeConfig.currencySymbol}${formatter.format(amount)}`
}
