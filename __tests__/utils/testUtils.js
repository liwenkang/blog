import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui, options = {}) => render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}

// Mock Next.js image
export const mockImage = jest.fn().mockImplementation(({ src, alt, ...props }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} {...props} />
))
