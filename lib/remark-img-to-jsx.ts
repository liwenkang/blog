import { visit } from 'unist-util-visit'
import sizeOf from 'image-size'
import fs from 'fs'
import type { Node, Parent } from 'unist'

interface ImageNode extends Node {
  type: 'image' | 'mdxJsxFlowElement'
  url?: string
  alt?: string
  name?: string
  attributes?: Array<{
    type: string
    name: string
    value: string | number
  }>
}

interface ParagraphNode extends Parent {
  type: 'paragraph' | 'div'
  children: ImageNode[]
}

export default function remarkImgToJsx() {
  return (tree: Node) => {
    visit(
      tree,
      // only visit p tags that contain an img element
      (node: Node): node is ParagraphNode => {
        const paragraphNode = node as ParagraphNode
        return (
          paragraphNode.type === 'paragraph' &&
          Array.isArray(paragraphNode.children) &&
          paragraphNode.children.some((n) => n.type === 'image')
        )
      },
      (node: ParagraphNode) => {
        const imageNode = node.children.find((n) => n.type === 'image')
        if (!imageNode || !imageNode.url) return

        // only local files
        const imagePath = `${process.cwd()}/public${imageNode.url}`
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath)
          const dimensions = sizeOf(imageBuffer)

          // Convert original node to next/image
          imageNode.type = 'mdxJsxFlowElement'
          imageNode.name = 'Image'
          imageNode.attributes = [
            { type: 'mdxJsxAttribute', name: 'alt', value: imageNode.alt || '' },
            { type: 'mdxJsxAttribute', name: 'src', value: imageNode.url },
            { type: 'mdxJsxAttribute', name: 'width', value: dimensions.width || 0 },
            { type: 'mdxJsxAttribute', name: 'height', value: dimensions.height || 0 },
          ]

          // Change node type from p to div to avoid nesting error
          node.type = 'div'
          node.children = [imageNode]
        }
      }
    )
  }
}
