import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./ui/button"

interface Section {
  title: string
  content: string
}

interface BusinessIdeaAnalysisProps {
  analysis: {
    sections: Section[]
  }
  className?: string
}

export function BusinessIdeaAnalysis({ analysis, className }: BusinessIdeaAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({})

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Function to format content with proper spacing and lists
  const formatContent = (content: string) => {
    if (!content) return null
    
    // Split by double newlines first to handle paragraphs
    return content.split('\n\n').map((paragraph, pIndex) => {
      // Handle bullet points and numbered lists
      if (paragraph.trim().startsWith('* ') || /^\d+\.\s/.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(Boolean)
        const isOrderedList = /^\d+\.\s/.test(items[0]?.trim() || '')
        
        const ListComponent = isOrderedList ? 'ol' : 'ul'
        const listStyle = isOrderedList ? 'list-decimal ml-6' : 'list-disc ml-6'
        
        return (
          <div key={pIndex} className="mb-4">
            <ListComponent className={listStyle}>
              {items.map((item, i) => (
                <li key={i} className="mb-2">
                  {item.replace(/^[\*\d+\.]+\s*/, '')}
                </li>
              ))}
            </ListComponent>
          </div>
        )
      }
      
      // Handle bold text
      const boldRegex = /\*\*(.*?)\*\*/g
      let formattedParagraph = []
      let lastIndex = 0
      let match
      
      while ((match = boldRegex.exec(paragraph)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          formattedParagraph.push(paragraph.slice(lastIndex, match.index))
        }
        // Add the bold text
        formattedParagraph.push(<strong key={match.index}>{match[1]}</strong>)
        lastIndex = match.index + match[0].length
      }
      
      // Add remaining text
      if (lastIndex < paragraph.length) {
        formattedParagraph.push(paragraph.slice(lastIndex))
      }
      
      return (
        <p key={pIndex} className="mb-4 leading-relaxed">
          {formattedParagraph.length > 0 ? formattedParagraph : paragraph}
        </p>
      )
    })
  }

  // Categorize sections for better organization
  const problemSections = analysis.sections.filter(section => 
    section.title.toLowerCase().includes('problem') || 
    section.title.toLowerCase().includes('validation')
  )
  
  const marketSections = analysis.sections.filter(section => 
    section.title.toLowerCase().includes('market') || 
    section.title.toLowerCase().includes('demand') ||
    section.title.toLowerCase().includes('competition')
  )
  
  const solutionSections = analysis.sections.filter(section => 
    section.title.toLowerCase().includes('solution') || 
    section.title.toLowerCase().includes('recommendation') ||
    section.title.toLowerCase().includes('viability')
  )
  
  const otherSections = analysis.sections.filter(section => 
    !problemSections.includes(section) && 
    !marketSections.includes(section) && 
    !solutionSections.includes(section)
  )

  const renderSection = (section: Section, index: number) => {
    const isExpanded = expandedSections[index] !== false // Default to expanded
    
    return (
      <Card key={index} className="mb-4 overflow-hidden border border-gray-200 dark:border-gray-800">
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
          onClick={() => toggleSection(index)}
        >
          <h3 className="text-lg font-semibold">{section.title}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {isExpanded && (
          <div className="px-4 pb-4 pt-0">
            <div className="prose max-w-none dark:prose-invert">
              {formatContent(section.content)}
            </div>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Problem Definition Section */}
      {problemSections.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Problem Analysis</h2>
          <div className="space-y-4">
            {problemSections.map((section, index) => renderSection(section, index))}
          </div>
        </div>
      )}

      {/* Market Analysis Section */}
      {marketSections.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Market Analysis</h2>
          <div className="space-y-4">
            {marketSections.map((section, index) => renderSection(section, index + 100))}
          </div>
        </div>
      )}

      {/* Solution & Viability Section */}
      {solutionSections.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Solution & Viability</h2>
          <div className="space-y-4">
            {solutionSections.map((section, index) => renderSection(section, index + 200))}
          </div>
        </div>
      )}

      {/* Other Sections */}
      {otherSections.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Additional Analysis</h2>
          <div className="space-y-4">
            {otherSections.map((section, index) => renderSection(section, index + 300))}
          </div>
        </div>
      )}
    </div>
  )
}
