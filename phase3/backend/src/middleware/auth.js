function requireAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ error: 'Unauthenticated' });
}

function requireRole(role) {
    return (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const userRole = (req.session.user.role || '').toLowerCase();
    if (userRole !== role.toLowerCase()) {
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
    };
}


module.exports = { requireAuth, requireRole };
