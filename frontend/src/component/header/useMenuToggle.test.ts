import {act, renderHook} from '@testing-library/react'
import {useLocation} from 'react-router-dom'
import {useMenuToggle} from './useMenuToggle'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}))

describe('useMenuToggle', () => {
  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
  }

  const mockLocationPath = (path: string) => {
    ;(useLocation as jest.Mock).mockReturnValue({
      pathname: path,
    })
  }

  beforeEach(() => {
    mockLocationPath('/')
    setWindowWidth(600)
  })

  const toggleAndExpect = (result: any, expectedState: boolean) => {
    act(() => {
      result.current.toggleMenu()
    })
    expect(result.current.isOpen).toBe(expectedState)
  }

  it('should toggle isOpen state when toggleMenu is called', () => {
    const {result} = renderHook(() => useMenuToggle())

    toggleAndExpect(result, true)
    toggleAndExpect(result, false)
  })

  it('should set isOpen to false when location changes', () => {
    const {result, rerender} = renderHook(() => useMenuToggle())

    toggleAndExpect(result, true)

    mockLocationPath('/new-location')
    rerender()

    expect(result.current.isOpen).toBe(false)
  })

  it('should set isOpen to false when window is resized to width greater than 768px and menu is open', () => {
    const {result} = renderHook(() => useMenuToggle())

    toggleAndExpect(result, true)

    setWindowWidth(800)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('should not change isOpen state when window is resized to width less than or equal to 768px', () => {
    const {result} = renderHook(() => useMenuToggle())

    toggleAndExpect(result, true)

    setWindowWidth(700)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isOpen).toBe(true)
  })
})
