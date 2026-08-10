import { NextResponse } from "next/server"

import { readDataVideo } from "@/lib/data-video"

export async function GET() {
  const { videos } = readDataVideo()
  return NextResponse.json({ films: videos })
}
