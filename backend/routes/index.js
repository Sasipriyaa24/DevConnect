import { Router } from 'express'

// Router instance — individual resource routers (posts, users, …) will mount here later
const router = Router()

router.get('/health', (req, res) => {
  res.json({ ok: true, scope: 'api', time: new Date().toISOString() })
})

export default router
