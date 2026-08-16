import { describe, expect, it } from 'vitest'
import { plainText } from './plain-text'

describe('plainText', () => {
  it('bóc thẻ span kèm style của editor cũ', () => {
    const raw =
      'The <span style="font-weight: 700; font-style: italic;">AI-Chatbot</span> application utilizes OpenAI.'
    expect(plainText(raw)).toBe('The AI-Chatbot application utilizes OpenAI.')
  })

  it('không nuốt mất chữ nằm giữa các thẻ', () => {
    expect(plainText('<b>Kafka</b> và <i>Redis</i>')).toBe('Kafka và Redis')
  })

  it('đổi thẻ ngắt dòng thành khoảng trắng thay vì dính chữ', () => {
    expect(plainText('dòng một<br/>dòng hai')).toBe('dòng một dòng hai')
    expect(plainText('<p>một</p><p>hai</p>')).toBe('một hai')
  })

  it('giải mã entity thường gặp', () => {
    expect(plainText('Docker &amp; Kubernetes')).toBe('Docker & Kubernetes')
    expect(plainText('&lt;script&gt; không chạy')).toBe('<script> không chạy')
  })

  it('gộp khoảng trắng thừa sinh ra sau khi bóc thẻ', () => {
    expect(plainText('<p>  a  </p>   <p>  b  </p>')).toBe('a b')
  })

  it('chuỗi thuần chữ giữ nguyên', () => {
    const s = 'API phục vụ toàn bộ site pinit. Giữ json-server lo CRUD.'
    expect(plainText(s)).toBe(s)
  })

  it('chịu được undefined và chuỗi rỗng', () => {
    expect(plainText(undefined)).toBe('')
    expect(plainText('')).toBe('')
  })
})
