type MarkdownNode = string | [string, Record<string, unknown>, ...unknown[]]

export function chapterSlugFromPath(path: string): string {
  const filename = path.split('/').pop() ?? ''
  return filename.replace(/\.md$/, '').replaceAll('_', '-').toLowerCase()
}

function nodeText(node: unknown): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.slice(2).map(nodeText).join('')
  return ''
}

const pageBreak = /^\s*<-{2,}\s*next\s*-{2,}>\s*$/i

export function scrolledReadingStep(stepId: string): string {
  return stepId.replace(/^reading-(\d+)$/, 'reading-scroll-$1')
}

export function visibleProgressStep(stepId: string): string | undefined {
  if (/^reading-(?:visit-)?\d+$/.test(stepId)) return undefined
  return stepId.replace(/^reading-scroll-(\d+)$/, 'reading-$1')
}

export function splitReadingPages(body: unknown): MarkdownNode[][] {
  const nodes = (body as { value?: MarkdownNode[] } | undefined)?.value ?? []
  const pages: MarkdownNode[][] = [[]]
  for (const node of nodes) {
    if (pageBreak.test(nodeText(node))) pages.push([])
    else pages[pages.length - 1]!.push(node)
  }

  const nonEmpty = pages.filter((page) => page.length > 0)
  return nonEmpty.length ? nonEmpty : [[]]
}
