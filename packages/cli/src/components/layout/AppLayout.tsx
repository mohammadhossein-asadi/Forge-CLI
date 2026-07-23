import React from 'react'
import { Box } from '../ui/Box.js'
import { Header } from './Header.js'
import { Footer } from './Footer.js'

export interface AppLayoutProps {
  children?: React.ReactNode
  header?: { subtitle?: string }
  footer?: { hint?: string }
}

export function AppLayout({ children, header, footer }: AppLayoutProps) {
  return (
    <Box flexDirection="column" gap={1}>
      <Header subtitle={header?.subtitle} />
      <Box flexDirection="column" gap={1} paddingLeft={1}>
        {children}
      </Box>
      <Footer hint={footer?.hint} />
    </Box>
  )
}
