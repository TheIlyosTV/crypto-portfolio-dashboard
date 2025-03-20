"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddAssetModal from "./add-asset-modal"

export default function AddAssetButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="mr-2 h-4 w-4" /> Add Asset
      </Button>

      <AddAssetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

