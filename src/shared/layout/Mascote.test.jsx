// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import Mascote from './Mascote'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Mascote', () => {
  it('uiva ao clicar e volta ao normal depois', () => {
    vi.useFakeTimers()
    render(<Mascote />)

    const lobinho = screen.getByRole('button', { name: /Lobinho/ })

    fireEvent.click(lobinho)
    expect(lobinho).toHaveClass('mascote-uivando')

    act(() => vi.advanceTimersByTime(1700))
    expect(lobinho).not.toHaveClass('mascote-uivando')
  })
})
