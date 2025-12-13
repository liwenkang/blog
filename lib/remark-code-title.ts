import { visit } from 'unist-util-visit'
import type { Node, Parent } from 'unist'

interface CodeNode extends Node {
  type: 'code'
  lang?: string
  value: string
}

export default function remarkCodeTitles() {
  return (tree: Node) =>
    visit(tree, 'code', (node: CodeNode, index: number | undefined, parent: Parent | undefined) => {
      if (index === undefined || !parent) return

      const nodeLang = node.lang || ''
      let language = ''
      let title = ''

      if (nodeLang.includes(':')) {
        language = nodeLang.slice(0, nodeLang.search(':'))
        title = nodeLang.slice(nodeLang.search(':') + 1, nodeLang.length)
      }

      if (!title) {
        return
      }

      const className = 'remark-code-title'

      const titleNode = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: className }],
        children: [{ type: 'text', value: title }],
        data: { _xdmExplicitJsx: true },
      }

      parent.children.splice(index, 0, titleNode)
      node.lang = language
    })
}
