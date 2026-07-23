export async function runCompletion(shell: string): Promise<void> {
  const completions: Record<string, string> = {
    bash: `# Forge CLI bash completion
_forgocomplete() {
    local cur prev commands
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    commands="create init config plugin doctor upgrade completion"

    if [[ \${cur} == -* ]]; then
        COMPREPLY=( $(compgen -W "--help --version --verbose --quiet --json --no-color" -- \${cur}) )
        return 0
    fi

    COMPREPLY=( $(compgen -W "\${commands}" -- \${cur}) )
    return 0
}
complete -F _forgocomplete forge`,

    zsh: `# Forge CLI zsh completion
_forgocomplete() {
    local commands
    commands="create init config plugin doctor upgrade completion"

    if (( CURRENT == 2 )); then
        compadd \${commands}
    fi
}

compdef _forgocomplete forge`,

    fish: `# Forge CLI fish completion
complete -c forge -f
complete -c forge -n '__fish_use_subcommand' -a create -d 'Create a new project'
complete -c forge -n '__fish_use_subcommand' -a init -d 'Initialize Forge in an existing project'
complete -c forge -n '__fish_use_subcommand' -a config -d 'Manage Forge configuration'
complete -c forge -n '__fish_use_subcommand' -a plugin -d 'Manage Forge plugins'
complete -c forge -n '__fish_use_subcommand' -a doctor -d 'Run health checks'
complete -c forge -n '__fish_use_subcommand' -a upgrade -d 'Upgrade Forge CLI'
complete -c forge -n '__fish_use_subcommand' -a completion -d 'Generate shell completion'
complete -c forge -l version -s V -d 'Output version number'
complete -c forge -l verbose -d 'Enable verbose output'
complete -c forge -l quiet -d 'Suppress all output'
complete -c forge -l json -d 'Output in JSON format'
complete -c forge -l no-color -d 'Disable colored output'`,
  }

  const script = completions[shell]
  if (!script) {
    console.log(`Unsupported shell: ${shell}`)
    console.log('Supported shells: bash, zsh, fish')
    return
  }

  console.log(script)
}
