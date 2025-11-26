// Access Guard - Must be loaded first, before any content renders
(async function() {
  'use strict';
  
  // Extract book slug from current page
  const path = window.location.pathname;
  const match = path.match(/\/livros\/(.+?)\.html$/);
  if (!match) return; // Not a book page
  
  const bookSlug = match[1];
  
  try {
    // Check access via API
    const res = await fetch(`/api/auth/validate?bookSlug=${encodeURIComponent(bookSlug)}`);
    const data = await res.json();
    
    if (!res.ok || !data.valid) {
      // Access denied - redirect immediately
      console.log(`[ACCESS GUARD] Access denied to: ${bookSlug}`);
      window.location.href = '/auth/no-access.html';
      return;
    }
    
    console.log(`[ACCESS GUARD] Access granted to: ${bookSlug}`);
  } catch (err) {
    console.error('[ACCESS GUARD] Validation error:', err);
    // On error, redirect to no-access page
    window.location.href = '/auth/no-access.html';
  }
})();
