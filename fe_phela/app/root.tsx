import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useLocation,
} from "react-router";
import { useAuth, AuthProvider } from "./AuthContext";
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { toastContainerConfig } from './utils/notificationConfig';
import { AnimatePresence } from 'framer-motion';
import GlobalLoading from './components/common/GlobalLoading';
import PageTransition from './components/common/PageTransition';

import type { Route } from "./+types/root";

// Import file CSS dưới dạng URL
import toastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import appStyles from "./app.css?url";
import headOrderStyles from "./assets/css/head_order.css?url";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: toastifyStyles },
  { rel: "stylesheet", href: appStyles },
  { rel: "stylesheet", href: headOrderStyles },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#2b1b12]">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const AppWithAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const role = import.meta.env.VITE_ROLE;

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.type === 'admin' && !location.pathname.startsWith('/admin')) {
        navigate('/admin');
      } else if (user.type === 'customer' && location.pathname.startsWith('/admin')) {
        navigate('/');
      }
    } else if (role) {
      if (role === 'admin' && !location.pathname.startsWith('/admin')) {
        navigate('/admin');
      } else if (role === 'customer' && location.pathname.startsWith('/admin')) {
        navigate('/');
      }
    }
  }, [navigate, user, loading, location.pathname, role]);

  return (
    <>
      <GlobalLoading isLoading={loading} />
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
      <ToastContainer {...toastContainerConfig} />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
