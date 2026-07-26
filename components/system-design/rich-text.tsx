import { parseTermMarkers } from '@/utils/system-design'
import { Fragment, ReactNode } from 'react'
import { TermLink } from './term-link'

export interface RichTextProps {
  text: string
}

/** Render một đoạn văn, đổi mọi marker [[Term]] thành link sang từ điển. */
export function RichText({ text }: RichTextProps): ReactNode {
  return (
    <>
      {parseTermMarkers(text).map((token, index) =>
        token.type === 'term' ? (
          <TermLink key={index} term={token.value} />
        ) : (
          <Fragment key={index}>{token.value}</Fragment>
        ),
      )}
    </>
  )
}
