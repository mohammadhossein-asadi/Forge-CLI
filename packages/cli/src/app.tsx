import { Text } from 'ink'

export interface AppProps {
  command?: string
}

export function App({ command }: AppProps) {
  return (
    <Text>
      {command ? `Running command: ${command}` : 'Forge CLI'}
    </Text>
  )
}
