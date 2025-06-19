"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sparkles } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { BusinessIdeaAnalysis } from "@/components/business-idea-analysis"

interface Section {
  title: string
  content: string
}

interface Analysis {
  sections: Section[]
}

interface IdeaData {
  ideaDescription: string
  proposedSolution: string
  intendedUsers: string
  geographicFocus: string
}

export default function IdeaAnalyser() {
  const [formData, setFormData] = useState<IdeaData>({
    ideaDescription: "",
    proposedSolution: "",
    intendedUsers: "",
    geographicFocus: "",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [useMockApi, setUseMockApi] = useState(false)
  const { toast } = useToast()

  // Function to format the analysis data for the BusinessIdeaAnalysis component
  const formatAnalysisData = (data: any) => {
    if (!data || !data.sections) return null
    
    // If already in the correct format, return as is
    if (Array.isArray(data.sections)) {
      return data
    }
    
    // If it's a string, try to parse it as markdown sections
    if (typeof data === 'string') {
      // Simple heuristic: Split by ## for markdown headers
      const sections = data.split(/##\s+(.*?)\n/).filter(Boolean)
      const result = { sections: [] as Array<{title: string, content: string}> }
      
      for (let i = 0; i < sections.length; i += 2) {
        if (sections[i + 1]) {
          result.sections.push({
            title: sections[i].trim(),
            content: sections[i + 1].trim()
          })
        }
      }
      
      if (result.sections.length > 0) {
        return result
      }
    }
    
    // Fallback to default sections if parsing fails
    return {
      sections: [
        {
          title: "Analysis",
          content: data
        }
      ]
    }
  }

  const handleInputChange = (field: keyof IdeaData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = async () => {
    if (!formData.ideaDescription.trim()) {
      toast({
        title: "Error",
        description: "Please describe the problem you're trying to solve",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)

    try {
      // Use a timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout

      // Determine which API endpoint to use
      const apiEndpoint = useMockApi ? "/api/mock-idea-analysis" : "/api/openai-idea-analysis"

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if the response is ok
      if (!response.ok) {
        // If the OpenAI API fails and we're not already using the mock API, try the mock API
        if (!useMockApi) {
          console.log("OpenAI API failed, falling back to mock API")
          setUseMockApi(true)

          // Try again with the mock API
          const mockResponse = await fetch("/api/mock-idea-analysis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          })

          if (!mockResponse.ok) {
            const responseText = await mockResponse.text()
            console.error("Mock API error response:", responseText)
            throw new Error(
              `Both APIs failed. Mock API returned ${mockResponse.status}: ${responseText.substring(0, 100)}...`,
            )
          }

          const data = await mockResponse.json()

          if (data.error) {
            throw new Error(data.error)
          }

          setAnalysis(data.analysis)
          toast({
            title: "Analysis Complete (Using Mock Data)",
            description: "Your business idea has been analyzed using our offline analysis engine.",
          })
          setIsAnalyzing(false)
          return
        }

        // If we're already using the mock API and it failed, show the error
        const responseText = await response.text()
        console.error("Error response:", responseText)
        throw new Error(`Server returned ${response.status}: ${responseText.substring(0, 100)}...`)
      }

      // Try to parse the JSON response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        // If JSON parsing fails, get the raw text
        const responseText = await response.text()
        console.error("Invalid JSON response:", responseText)
        throw new Error(`Server returned invalid JSON. Response: ${responseText.substring(0, 100)}...`)
      }

      // Check if there's an error in the response
      if (data.error) {
        throw new Error(data.error)
      }

      setAnalysis(data.analysis)
      toast({
        title: "Analysis Complete",
        description: useMockApi
          ? "Your business idea has been analyzed using our offline analysis engine."
          : "Your business idea has been analyzed successfully.",
      })
    } catch (err) {
      console.error("Error analyzing idea:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formattedAnalysis = formatAnalysisData(analysis)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Business Idea Analyzer</h1>
          <p className="text-muted-foreground">
            This analysis is designed to prevent the single greatest cause of startup failure: investing time, money, and effort into building a product that nobody wants. The journey begins not with a solution, but with a deep understanding of a problem.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Enter Your Business Idea</CardTitle>
                <CardDescription>
                  Fill in the details about your business idea to get started.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idea">What problem are you trying to solve?*</Label>
                  <Textarea
                    id="idea"
                    placeholder="Describe the problem you're trying to solve in detail..."
                    className="min-h-[120px]"
                    value={formData.ideaDescription}
                    onChange={(e) => handleInputChange("ideaDescription", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">Proposed Solution (Optional)</Label>
                  <Textarea
                    id="solution"
                    placeholder="What problem does your idea solve?"
                    className="min-h-[100px]"
                    value={formData.proposedSolution}
                    onChange={(e) => handleInputChange("proposedSolution", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="users">Intended Users (Optional)</Label>
                  <Textarea
                    id="users"
                    placeholder="Who is your target audience?"
                    className="min-h-[80px]"
                    value={formData.intendedUsers}
                    onChange={(e) => handleInputChange("intendedUsers", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Geographic Focus (Optional)</Label>
                  <Textarea
                    id="location"
                    placeholder="Where will your business operate?"
                    className="min-h-[60px]"
                    value={formData.geographicFocus}
                    onChange={(e) => handleInputChange("geographicFocus", e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="use-mock"
                        checked={useMockApi}
                        onCheckedChange={setUseMockApi}
                      />
                      <Label htmlFor="use-mock">Use offline analysis</Label>
                    </div>
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing || !formData.ideaDescription.trim()}
                      className="gap-2"
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" />Analyze Idea</>
                      )}
                    </Button>
                  </div>
                  {!formData.ideaDescription.trim() && (
                    <p className="text-sm text-muted-foreground">
                      Please describe the problem you're trying to solve to enable analysis
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="border-b">
                <CardTitle className="text-2xl">Analysis Results</CardTitle>
                <CardDescription>
                  {formattedAnalysis
                    ? "Detailed analysis of your business idea"
                    : "Submit your idea to see the analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
                      <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-primary/5">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Analyzing your idea</h3>
                    <p className="text-muted-foreground max-w-md">
                      Our AI is carefully evaluating your business concept. This may take a moment...
                    </p>
                  </div>
                ) : formattedAnalysis ? (
                  <div className="p-6">
                    <BusinessIdeaAnalysis analysis={formattedAnalysis} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="bg-primary/5 p-4 rounded-full mb-6">
                      <Sparkles className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Ready to analyze your idea</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Fill in your business idea details and click "Analyze Idea" to get
                      a comprehensive analysis of your business potential.
                    </p>
                    <div className="grid gap-3 text-left text-sm text-muted-foreground max-w-md w-full">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                        </div>
                        <p>Detailed market analysis</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                        </div>
                        <p>Problem-solution fit evaluation</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                        </div>
                        <p>Competitive landscape</p>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="m-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-destructive" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-destructive">Error analyzing your idea</h3>
                        <div className="mt-2 text-sm text-destructive/80">
                          <p>{error}</p>
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive/50"
                            onClick={() => setError(null)}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
