import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/upload(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jinja2|txt|xml|ico|webp|avif|jpg|jpeg|gif|svg|ttf|woff2?|eot|otf|map)).*)','/(api|trpc)(.*)'],
}