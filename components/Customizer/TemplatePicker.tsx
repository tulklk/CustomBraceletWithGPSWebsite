"use client"

import { Template } from "@/lib/types"
import { useCustomizer } from "@/store/useCustomizer"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { Check } from "lucide-react"
import Image from "next/image"

interface TemplatePickerProps {
  templates: Template[]
}

export function TemplatePicker({ templates }: TemplatePickerProps) {
  const { templateId, setTemplate } = useCustomizer()

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            templateId === template.id && "ring-2 ring-primary"
          )}
          onClick={() =>
            setTemplate(template.id, template.basePrice, template.defaultColors)
          }
        >
          <CardContent className="p-4">
            <div className="aspect-square bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
              {/* Display PNG image like preview 2D */}
              <Image
                src={template.preview}
                alt={template.name}
                width={200}
                height={200}
                className="object-contain w-full h-full p-4"
                priority
              />
              {templateId === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 text-primary">{template.name}</h3>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {template.description}
            </p>
            <p className="text-sm font-bold text-primary">
              {formatCurrency(template.basePrice)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

