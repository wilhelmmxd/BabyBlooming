"use client"

import { useState } from "react"
import { useChildren } from "@/lib/children-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

export function AddChildDialog() {
  const { addChild } = useChildren()
  const [childName, setChildName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [sex, setSex] = useState<"male" | "female" | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!childName.trim()) {
      setError("Please enter your child's name")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      await addChild(
        childName,
        birthDate || undefined,
        sex ? (sex as "male" | "female") : undefined
      )
      setIsOpen(false)
      setChildName("")
      setBirthDate("")
      setSex("")
    } catch (err) {
      setError((err as Error).message || "Failed to add child")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-9 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Another Child</DialogTitle>
          <DialogDescription>
            Enter your child's information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddChild} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="childName" className="text-sm font-medium">
              Child's Name *
            </Label>
            <Input
              id="childName"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g., Emma"
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-sm font-medium">
              Birth Date (optional)
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Sex (optional)</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="male"
                  checked={sex === "male"}
                  onChange={(e) => setSex(e.target.value as "male")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value="female"
                  checked={sex === "female"}
                  onChange={(e) => setSex(e.target.value as "female")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Female</span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button className="flex-1" type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Child"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
