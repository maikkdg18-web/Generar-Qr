import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QrCodeCanvas({ value, colorFg = '#000000', colorBg = '#FFFFFF', logoUrl, size = 280, canvasRef }) {
  const internalRef = useRef(null)
  const ref = canvasRef ?? internalRef

  useEffect(() => {
    if (!value || !ref.current) return

    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 2,
      color: { dark: colorFg, light: colorBg },
      errorCorrectionLevel: logoUrl ? 'H' : 'M',
    }).then(() => {
      if (!logoUrl) return
      const canvas = ref.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const logoSize = size * 0.2
        const x = (size - logoSize) / 2
        const y = (size - logoSize) / 2
        ctx.fillStyle = colorBg
        ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8)
        ctx.drawImage(img, x, y, logoSize, logoSize)
      }
      img.src = logoUrl
    })
  }, [value, colorFg, colorBg, logoUrl, size, ref])

  return <canvas ref={ref} className="rounded-lg" />
}
