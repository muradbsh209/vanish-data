const STORE: Record<string, any> = {}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, encrypted, name, expiresAt, viewOnce, mimeType, isText } = body
    if (!id || !encrypted) {
      return new Response(JSON.stringify({ error: 'missing id or encrypted data' }), { status: 400 })
    }
    STORE[id] = { encrypted, name, expiresAt, viewOnce, mimeType, isText: isText || false, createdAt: Date.now() }
    console.log(`[API] Stored ${isText ? 'text' : 'file'} ${id}, expires at ${new Date(expiresAt).toISOString()}`)
    return new Response(JSON.stringify({ ok: true, id }), { status: 200 })
  } catch (e) {
    console.error('[API] POST error:', e)
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if(!id) return new Response(JSON.stringify({ error: 'missing id' }), { status: 400 })
    const item = STORE[id]
    if(!item) {
      console.log(`[API] File not found: ${id}`)
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404 })
    }
    // expire check
    if(item.expiresAt && Date.now() > item.expiresAt) {
      console.log(`[API] File expired: ${id}`)
      delete STORE[id]
      return new Response(JSON.stringify({ error: 'expired' }), { status: 404 })
    }
    console.log(`[API] Retrieving ${item.isText ? 'text' : 'file'} ${id}, viewOnce=${item.viewOnce}`)
    // If viewOnce, return and delete
    const payload = { encrypted: item.encrypted, name: item.name, expiresAt: item.expiresAt, viewOnce: item.viewOnce, mimeType: item.mimeType, isText: item.isText, createdAt: item.createdAt, ip: req.headers.get('x-forwarded-for') || '0.0.0.0' }
    if(item.viewOnce) {
      console.log(`[API] Deleting file after view: ${id}`)
      delete STORE[id]
    }
    return new Response(JSON.stringify(payload), { status: 200 })
  } catch (e) {
    console.error('[API] GET error:', e)
    return new Response(JSON.stringify({ error: 'server error' }), { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const id = body?.id
    if(id && STORE[id]) delete STORE[id]
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 500 })
  }
}
