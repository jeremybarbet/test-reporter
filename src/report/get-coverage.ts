import {dedent} from 'ts-dedent'

import {Coverage, JestCoverage} from '../main'
import {Align, table} from '../utils/markdown-utils'

interface Summary {
  statements: string
  branches: string
  functions: string
  lines: string
}

const renderPctStatus = (pct: number): string => {
  if (pct >= 80) {
    return '🟢'
  } else if (pct < 80 && pct >= 70) {
    return '🟠'
  }

  return '🔴'
}

const renderLine = (name: string, pct: number, covered: number, total: number): string =>
  `${renderPctStatus(pct)} <strong>&nbsp;${pct}%</strong> ${name} <code>${covered}/${total}</code>`

const renderRow = (pct: number, covered: number, total: number): string =>
  `${renderPctStatus(pct)}&nbsp;&nbsp;${pct}% <code>${covered}/${total}</code>`

const renderSummary = (total: JestCoverage): Summary => {
  const statements = renderLine('Statements', total.statements.pct, total.statements.covered, total.statements.total)
  const branches = renderLine('Branches', total.branches.pct, total.branches.covered, total.branches.total)
  const functions = renderLine('Functions', total.functions.pct, total.functions.covered, total.functions.total)
  const lines = renderLine('Lines', total.lines.pct, total.lines.covered, total.lines.total)

  return {
    statements,
    branches,
    functions,
    lines
  }
}

export function getCoverage(results: Coverage[]): string {
  const sections: {summary: Summary; table: string}[] = []

  for (const result of results) {
    const rows: string[][] = []
    const summary = renderSummary(result.total)

    for (const file of result.files) {
      const statements = renderRow(
        file.coverage.statements.pct,
        file.coverage.statements.covered,
        file.coverage.statements.total
      )

      const branches = renderRow(
        file.coverage.branches.pct,
        file.coverage.branches.covered,
        file.coverage.branches.total
      )

      const functions = renderRow(
        file.coverage.functions.pct,
        file.coverage.functions.covered,
        file.coverage.functions.total
      )

      const lines = renderRow(file.coverage.lines.pct, file.coverage.lines.covered, file.coverage.lines.total)
      const basePath = '/home/runner/work/api/'

      rows.push([file.path.replace(basePath, ''), statements, branches, functions, lines])
    }

    const resultsTable = table(
      ['Path', 'Statements', 'Branches', 'Functions', 'Lines'],
      [Align.Left, Align.Right, Align.Right, Align.Right, Align.Right],
      ...rows
    )

    sections.push({
      summary,
      table: resultsTable
    })
  }

  return sections
    .map(
      section => `### Total coverage stats

* ${section.summary.statements}
* ${section.summary.branches}
* ${section.summary.functions}
* ${section.summary.lines}

### All files stats
${section.table}`
    )
    .map(section => dedent(section))
    .join('\n')
}
