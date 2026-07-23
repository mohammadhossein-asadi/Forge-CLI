import {
  definePlugin,
  defineCommand,
  defineHook,
  createPluginLogger,
} from '@forge/plugin-sdk'

const logger = createPluginLogger('hello')

const helloCommand = defineCommand({
  id: 'hello:greet',
  name: 'greet',
  description: 'Say hello from the hello plugin',
  category: 'example',
  args: [
    {
      name: 'name',
      description: 'Name to greet',
      required: false,
      type: 'string',
    },
  ],
  flags: [
    {
      name: 'loud',
      char: 'l',
      description: 'Greet LOUDLY',
      type: 'boolean',
    },
  ],
  execute: (ctx) => {
    const name = (ctx.args.name as string) ?? 'World'
    const loud = ctx.flags.loud as boolean
    const greeting = loud ? `HELLO, ${name.toUpperCase()}!` : `Hello, ${name}!`
    logger.info(greeting)
    return { success: true, message: greeting }
  },
})

const logHook = defineHook({
  event: 'command:prerun',
  priority: 10,
  handler: (data) => {
    const { commandId } = data as { commandId: string }
    logger.debug(`About to run command: ${commandId}`)
  },
})

const plugin = definePlugin(
  {
    name: '@forge/plugin-hello',
    version: '1.0.0',
    description: 'Example plugin for Forge CLI',
    author: 'Forge Team',
    license: 'MIT',
    keywords: ['example', 'hello'],
    commands: [helloCommand],
    hooks: [logHook],
  },
  async (ctx) => {
    logger.info(`Hello plugin loaded! Workspace: ${ctx.workspace}`)
  },
)

export default plugin
