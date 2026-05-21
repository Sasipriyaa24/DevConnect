/**
 * JWT verification middleware will be implemented when auth routes are added.
 * Pattern: read `Authorization: Bearer <token>`, verify signature, attach `req.user`.
 */
export function requireAuth(req, res, next) {
  return res.status(501).json({ error: 'Authentication is not wired up yet.' })
}
