'use client'

import * as React from "react"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { components } from "../app/data"

export const ComponentsPicker = () => {
  const router = useRouter()

  const handleSelectChange = (value: string) => {
    router.push(`/${value}`)
  }

  return (
    <div className="fixed left-1/2 -translate-x-1/2 mt-5 z-[99999] top-0">
      <Select onValueChange={handleSelectChange}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a Component" />
        </SelectTrigger>
        <SelectContent className="max-h-[260px]">
          <SelectGroup>
            {components.map((component,i) => (
              <SelectItem 
                  value={`${component}`}
                  key={i}
                >
                  {component}
                </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
