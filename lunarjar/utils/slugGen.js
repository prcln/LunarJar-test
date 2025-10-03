
export function createUniqueSlug(name) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add timestamp in base36 (short alphanumeric)
  const uniqueSuffix = Date.now().toString(36);
  
  return `${baseSlug}-${uniqueSuffix}`;
}