// 提示词分段管理器
export interface PromptSegment {
  id: string
  title: string
  content: string
  order: number
  isComplete: boolean
}

export class PromptSegmenter {
  private static readonly SEGMENT_MARKERS = {
    start: '【',
    end: '】',
    dimension: '**',
  }

  // 检测内容是否被截断
  static isContentTruncated(content: string): boolean {
    // 检查常见的截断标志
    const truncationPatterns = [
      /[^。！？\n]\s*$/,  // 不是以句号、感叹号、问号结尾
      /^- [^。！？\n]*$/m,  // 列表项没有结束
      /\*\*[^*]+$/,  // 星号标记没有闭合
      /【[^】]+$/,  // 中括号没有闭合
    ]
    
    return truncationPatterns.some(pattern => pattern.test(content.trim()))
  }

  // 解析提示词为分段
  static parseSegments(content: string): PromptSegment[] {
    const segments: PromptSegment[] = []
    const lines = content.split('\n')
    
    let currentSegment: PromptSegment | null = null
    let segmentContent: string[] = []
    let order = 0

    for (const line of lines) {
      // 检测段落标题
      if (line.startsWith('【') && line.includes('】')) {
        // 保存前一个段落
        if (currentSegment) {
          currentSegment.content = segmentContent.join('\n').trim()
          currentSegment.isComplete = !this.isContentTruncated(currentSegment.content)
          segments.push(currentSegment)
        }
        
        // 开始新段落
        const title = line.match(/【([^】]+)】/)?.[1] || ''
        currentSegment = {
          id: `segment-${order}`,
          title,
          content: '',
          order: order++,
          isComplete: true
        }
        segmentContent = [line]
      } else if (currentSegment) {
        segmentContent.push(line)
      }
    }
    
    // 保存最后一个段落
    if (currentSegment) {
      currentSegment.content = segmentContent.join('\n').trim()
      currentSegment.isComplete = !this.isContentTruncated(currentSegment.content)
      segments.push(currentSegment)
    }
    
    return segments
  }

  // 检测并标记不完整的段落
  static markIncompleteSegments(segments: PromptSegment[]): PromptSegment[] {
    return segments.map((segment, index) => {
      // 最后一个段落特别检查
      if (index === segments.length - 1) {
        segment.isComplete = !this.isContentTruncated(segment.content)
      }
      return segment
    })
  }

  // 合并分段为完整内容
  static mergeSegments(segments: PromptSegment[]): string {
    return segments
      .sort((a, b) => a.order - b.order)
      .map(segment => segment.content)
      .join('\n\n')
  }

  // 生成段落摘要
  static generateSegmentSummary(segment: PromptSegment): string {
    const lines = segment.content.split('\n').filter(line => line.trim())
    const maxLines = 3
    
    if (lines.length <= maxLines) {
      return segment.content
    }
    
    return lines.slice(0, maxLines).join('\n') + '\n...'
  }
}

// 分段缓存管理
export class SegmentCache {
  private cache = new Map<string, PromptSegment[]>()
  
  set(promptId: string, segments: PromptSegment[]) {
    this.cache.set(promptId, segments)
  }
  
  get(promptId: string): PromptSegment[] | undefined {
    return this.cache.get(promptId)
  }
  
  update(promptId: string, segmentId: string, content: string) {
    const segments = this.cache.get(promptId)
    if (segments) {
      const segment = segments.find(s => s.id === segmentId)
      if (segment) {
        segment.content = content
        segment.isComplete = !PromptSegmenter.isContentTruncated(content)
      }
    }
  }
  
  clear(promptId?: string) {
    if (promptId) {
      this.cache.delete(promptId)
    } else {
      this.cache.clear()
    }
  }
}

export const segmentCache = new SegmentCache()