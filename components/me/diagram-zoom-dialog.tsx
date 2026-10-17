import { Box, Button, Dialog, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MdAdd, MdClose, MdRemove } from 'react-icons/md'
import { clampZoom, svgNaturalWidth } from '@/utils/svg-size'

const STEP = 1.25
const PAD = 16 // padding của vùng cuộn, mỗi bên

/**
 * Sơ đồ toàn màn hình. `svg` là SVG đã dựng sẵn ở server (utils/diagram.ts), lấy
 * nguyên từ thân bài — cùng nguồn tin cậy với chính thân bài, không phải output
 * của model. Màu vẫn đi theo biến `--diagram-*` trên :root nên đổi theme vẫn đúng.
 *
 * 100% = cỡ thật của SVG. Mở ra: sơ đồ rộng hơn màn hình → cỡ thật, cuộn để xem
 * (trên điện thoại "vừa màn hình" nhỏ tới mức không đọc được); hẹp hơn → vừa màn hình.
 */
export function DiagramZoomDialog({
  svg,
  onClose,
  disableRestoreFocus,
}: {
  svg: string | null
  onClose: () => void
  /** Bên gọi tự trả focus (node gốc có thể đã bị thay) — tắt cơ chế mặc định của MUI. */
  disableRestoreFocus?: boolean
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ natural: 0, fit: 1, zoom: 1 })
  const { natural, fit, zoom: z } = view
  const clamp = (z: number) => clampZoom(z, fit)

  // Đo lúc mở và khi đổi kích thước cửa sổ (chỉ ảnh hưởng mức "vừa màn hình").
  useLayoutEffect(() => {
    if (!svg) return
    const measure = (reset: boolean) => {
      const available = (scroller.current?.clientWidth ?? window.innerWidth) - 2 * PAD
      const nat = svgNaturalWidth(svg) ?? available
      const f = available / nat
      setView((v) => ({ natural: nat, fit: f, zoom: reset ? (nat > available ? 1 : f) : v.zoom }))
    }
    measure(true)
    const onResize = () => measure(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [svg])

  const setZoom = (z: number) => setView((v) => ({ ...v, zoom: z }))

  useEffect(() => {
    if (!svg) return
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '+' || e.key === '=')
        setView((v) => ({ ...v, zoom: clampZoom(v.zoom * STEP, v.fit) }))
      else if (e.key === '-') setView((v) => ({ ...v, zoom: clampZoom(v.zoom / STEP, v.fit) }))
      else if (e.key === '0') setView((v) => ({ ...v, zoom: v.fit }))
      else if (e.key === '1') setView((v) => ({ ...v, zoom: 1 }))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [svg])

  return (
    <Dialog
      fullScreen
      open={svg != null}
      onClose={onClose}
      disableRestoreFocus={disableRestoreFocus}
      aria-label="Sơ đồ phóng to"
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Tooltip title="Thu nhỏ (−)">
          <span>
            <IconButton
              aria-label="Thu nhỏ"
              onClick={() => setZoom(clamp(z / STEP))}
              disabled={z <= clamp(0)}
            >
              <MdRemove />
            </IconButton>
          </span>
        </Tooltip>
        <Typography
          variant="body2"
          sx={{ minWidth: 48, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.round(z * 100)}%
        </Typography>
        <Tooltip title="Phóng to (+)">
          <span>
            <IconButton
              aria-label="Phóng to"
              onClick={() => setZoom(clamp(z * STEP))}
              disabled={z >= clamp(Infinity)}
            >
              <MdAdd />
            </IconButton>
          </span>
        </Tooltip>
        <Button size="small" onClick={() => setZoom(fit)} disabled={Math.abs(z - fit) < 0.01}>
          Vừa màn hình
        </Button>
        <Button
          size="small"
          onClick={() => setZoom(1)}
          disabled={z === 1}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Cỡ thật
        </Button>
        <Box flexGrow={1} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          + / − · 0 vừa màn hình · 1 cỡ thật · Esc đóng
        </Typography>
        <IconButton aria-label="Đóng" onClick={onClose}>
          <MdClose />
        </IconButton>
      </Stack>
      <Box
        ref={scroller}
        sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'var(--diagram-bg)', p: `${PAD}px` }}
      >
        {svg && natural > 0 && (
          <Box
            // Nhỏ hơn vùng xem thì canh giữa; lớn hơn thì tràn và cuộn hai chiều.
            sx={{
              width: natural * z,
              mx: 'auto',
              '& svg': { display: 'block', width: '100%', height: 'auto', maxWidth: 'none' },
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </Box>
    </Dialog>
  )
}
