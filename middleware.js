export const config = {
  runtime: 'edge',
  matcher: '/livros/:path*',
};

export default async function middleware(req) {
  const url = new URL(req.url);
  console.log(`[MIDDLEWARE] Request to: ${url.pathname}`);
  
  const cookie = req.headers.get('cookie') || '';
  const hasSession = /(?:^|; )session=/.test(cookie);

  // If no session, redirect to login with next param
  if (!hasSession) {
    const loginUrl = new URL('/auth/login.html', url.origin);
    // Preserve requested path to return after login
    loginUrl.searchParams.set('next', url.pathname + (url.search || ''));
    return Response.redirect(loginUrl.toString(), 302);
  }

  // Validate grant for current book slug via internal API (Node runtime)
  const path = url.pathname; // e.g., /livros/vivencia_pombogira or /livros/vivencia_pombogira.html
  const match = path.match(/\/livros\/(.+?)(?:\.html)?$/);
  const bookSlug = match ? match[1] : undefined;

  if (bookSlug) {
    try {
      const validateUrl = new URL('/api/auth/validate', url.origin);
      validateUrl.searchParams.set('bookSlug', bookSlug);
      console.log(`[MIDDLEWARE] Validating access to: ${bookSlug}`);
      const res = await fetch(validateUrl.toString(), {
        headers: { cookie },
      });
      console.log(`[MIDDLEWARE] Validation response status: ${res.status}`);
      if (!res.ok) {
        // Redirect to no-access page instead of login
        const noAccessUrl = new URL('/auth/no-access.html', url.origin);
        return Response.redirect(noAccessUrl.toString(), 302);
      }
      const data = await res.json();
      if (!data.valid) {
        // Redirect to no-access page instead of login
        const noAccessUrl = new URL('/auth/no-access.html', url.origin);
        return Response.redirect(noAccessUrl.toString(), 302);
      }
    } catch (e) {
      console.error('Middleware validation error:', e);
      // Redirect to no-access page on error
      const noAccessUrl = new URL('/auth/no-access.html', url.origin);
      return Response.redirect(noAccessUrl.toString(), 302);
    }
  }

  // Allow the request to continue (Edge runtime will pass through)
  return;
}
