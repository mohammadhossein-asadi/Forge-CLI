import { EXIT_CODES } from '@forge/shared'
import { ForgeError } from './forge-error.js'

export class ErrorHandler {
  private verbose: boolean

  constructor(options?: { verbose?: boolean }) {
    this.verbose = options?.verbose ?? false
  }

  handle(error: unknown): never {
    if (error instanceof ForgeError) {
      this.handleForgeError(error)
    } else if (error instanceof Error) {
      this.handleGenericError(error)
    } else {
      this.handleUnknownError(error)
    }

    process.exit(EXIT_CODES.GENERAL_ERROR)
  }

  private handleForgeError(error: ForgeError): void {
    console.error(error.toFormattedString())
    if (this.verbose && error.cause) {
      console.error('\nCaused by:', error.cause.message)
      if (error.cause.stack) {
        console.error(error.cause.stack)
      }
    }
  }

  private handleGenericError(error: Error): void {
    console.error(`Error: ${error.message}`)
    if (this.verbose && error.stack) {
      console.error(error.stack)
    }
  }

  private handleUnknownError(error: unknown): void {
    console.error('An unexpected error occurred:', error)
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose
  }
}
