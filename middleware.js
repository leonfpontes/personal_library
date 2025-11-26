export const config = {
  runtime: 'edge',
  matcher: ['/livros/:path*'],
};

export default async function middleware(req) {
  const url = new URL(req.url);
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
  const path = url.pathname; // e.g., /livros/vivencia_pombogira.html
  const match = path.match(/\/livros\/(.+?)\.html$/);
  const bookSlug = match ? match[1] : undefined;

  if (bookSlug) {
    try {
      const validateUrl = new URL('/api/auth/validate', url.origin);
      validateUrl.searchParams.set('bookSlug', bookSlug);
      const res = await fetch(validateUrl.toString(), {
        headers: { cookie },
      });
      if (!res.ok) {
        const loginUrl = new URL('/auth/login.html', url.origin);
        loginUrl.searchParams.set('next', url.pathname);
        return Response.redirect(loginUrl.toString(), 302);
      }
      const data = await res.json();
      if (!data.valid) {
        const loginUrl = new URL('/auth/login.html', url.origin);
        loginUrl.searchParams.set('next', url.pathname);
        return Response.redirect(loginUrl.toString(), 302);
      }
    } catch (e) {
      const loginUrl = new URL('/auth/login.html', url.origin);
      loginUrl.searchParams.set('next', url.pathname);
      return Response.redirect(loginUrl.toString(), 302);
    }
  }

  // Continue to the requested page
  return new Response(null, {
    headers: req.headers
  });
}
