"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AzureReasonerTab } from "./azure-reasoner-tab"

export function ReasonerTabs() {
  return (
    <Tabs defaultValue="existing" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="existing">Existing Reasoner</TabsTrigger>
        <TabsTrigger value="azure">Azure Chain of Thought</TabsTrigger>
      </TabsList>
      <TabsContent value="existing">
        <div className="p-4 rounded-lg bg-card text-card-foreground">
          <h2 className="text-lg font-semibold">Existing Reasoner</h2>
          <p>Your existing reasoner content goes here.</p>
        </div>
      </TabsContent>
      <TabsContent value="azure">
        <AzureReasonerTab />
      </TabsContent>
    </Tabs>
  )
}

