import { Suspense } from 'react'
import Viewer from '../../../components/Viewer'

async function ViewerContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = await paramsPromise
  return <Viewer id={id} />
}

export default function ViewPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-slate-300">Loading viewer...</p></div>}>
        <ViewerContent paramsPromise={params} />
      </Suspense>
    </main>
  )
}
