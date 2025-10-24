"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCustomizer } from "@/store/useCustomizer"
import { MAX_ENGRAVE_LENGTH, ENGRAVE_FONTS, ENGRAVE_FEE } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Engrave } from "@/lib/types"

const engraveSchema = z.object({
  text: z
    .string()
    .max(MAX_ENGRAVE_LENGTH, `Tối đa ${MAX_ENGRAVE_LENGTH} ký tự`)
    .regex(
      /^[A-Za-z0-9\s-]*$/,
      "Chỉ cho phép chữ cái, số, khoảng trắng và dấu gạch"
    )
    .optional(),
  font: z.enum(ENGRAVE_FONTS),
  position: z.enum(["inside", "band"]),
})

type EngraveFormData = z.infer<typeof engraveSchema>

export function EngraveForm() {
  const { engrave, setEngrave } = useCustomizer()
  const { toast } = useToast()

  const form = useForm<EngraveFormData>({
    resolver: zodResolver(engraveSchema),
    defaultValues: {
      text: engrave?.text || "",
      font: engrave?.font || "Sans",
      position: engrave?.position || "inside",
    },
  })

  const onSubmit = (data: EngraveFormData) => {
    if (!data.text || data.text.trim().length === 0) {
      setEngrave(undefined)
      toast({
        title: "Đã xóa khắc tên",
      })
      return
    }

    const newEngrave: Engrave = {
      text: data.text.trim(),
      font: data.font,
      position: data.position,
    }

    setEngrave(newEngrave)
    toast({
      title: "Đã lưu khắc tên",
      description: `"${newEngrave.text}" - ${formatCurrency(ENGRAVE_FEE)}`,
    })
  }

  const watchText = form.watch("text")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Khắc tên (tùy chọn)</Label>
        <span className="text-xs text-muted-foreground">
          Phí: {formatCurrency(ENGRAVE_FEE)}
        </span>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="engrave-text">
            Nội dung khắc ({watchText?.length || 0}/{MAX_ENGRAVE_LENGTH})
          </Label>
          <Input
            id="engrave-text"
            placeholder="VD: KIDTRACK"
            {...form.register("text")}
            maxLength={MAX_ENGRAVE_LENGTH}
          />
          {form.formState.errors.text && (
            <p className="text-sm text-destructive">
              {form.formState.errors.text.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Chỉ cho phép A-Z, 0-9, khoảng trắng, dấu gạch (-)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="engrave-font">Font chữ</Label>
            <Select
              value={form.watch("font")}
              onValueChange={(value) =>
                form.setValue("font", value as (typeof ENGRAVE_FONTS)[number])
              }
            >
              <SelectTrigger id="engrave-font">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sans">Sans (Hiện đại)</SelectItem>
                <SelectItem value="Rounded">Rounded (Tròn)</SelectItem>
                <SelectItem value="Mono">Mono (Đều)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engrave-position">Vị trí</Label>
            <Select
              value={form.watch("position")}
              onValueChange={(value) =>
                form.setValue("position", value as "inside" | "band")
              }
            >
              <SelectTrigger id="engrave-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inside">Mặt trong</SelectItem>
                <SelectItem value="band">Dây đeo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {engrave ? "Cập nhật" : "Lưu khắc tên"}
          </Button>
          {engrave && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset({ text: "", font: "Sans", position: "inside" })
                setEngrave(undefined)
                toast({ title: "Đã xóa khắc tên" })
              }}
            >
              Xóa
            </Button>
          )}
        </div>
      </form>

      {engrave && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Preview khắc:</p>
          <p
            className="text-lg"
            style={{
              fontFamily:
                engrave.font === "Rounded"
                  ? "ui-rounded"
                  : engrave.font === "Mono"
                  ? "ui-monospace"
                  : "ui-sans-serif",
            }}
          >
            &quot;{engrave.text}&quot;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Vị trí: {engrave.position === "inside" ? "Mặt trong" : "Dây đeo"}
          </p>
        </div>
      )}
    </div>
  )
}

