const grants = { user: new Set(['notes:read', 'notes:write']), admin: new Set(['notes:read', 'notes:write', 'users:read']) };
export function can(actor, permission) { return !!actor && !!grants[actor.role]?.has(permission); }
export function owns(actor, resource) { return !!actor && !!resource && actor.id === resource.ownerId; }
