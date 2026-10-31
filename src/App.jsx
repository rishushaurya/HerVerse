import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { LanguageProvider, useLanguage } from '@/lib/LanguageContext';
import { base44 } from '@/api/base44Client';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SignIn from '@/pages/SignIn';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();
  const { switchTheme } = useTheme();
  const { switchLanguage } = useLanguage();
  const navigate = useNavigate();

  // Sync preferences and check onboarding status
  useEffect(() => {
    const checkPreferences = async () => {
      if (user && isAuthenticated) {
        try {
          const prefs = await base44.entities.UserPreferences.list();

          if (prefs && prefs.length > 0) {
            const userPrefs = prefs[0];
            const { theme, language, onboarding_completed } = userPrefs;

            // Sync UI
            if (theme) switchTheme(theme);
            if (language) switchLanguage(language);

            // Gatekeeper Removed: User can access app without onboarding
            // Preferences are synced, but we don't force redirect.
          }
        } catch (error) {
          console.error('Failed to sync preferences:', error);
        }
      }
    };
    checkPreferences();
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    // Router paths are case-insensitive, so this check must be too (createPageUrl gives /SignIn, /Start, ...).
    const publicPaths = ['/sign-in', '/signin', '/registration', '/onboarding', '/start'];
    if (!isLoadingAuth && !isAuthenticated && !publicPaths.includes(window.location.pathname.toLowerCase())) {
      navigate('/Start');
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/sign-in" element={<LayoutWrapper currentPageName="SignIn"><SignIn /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClientInstance}>
              <NavigationTracker />
              <AuthenticatedApp />
              <Toaster />
            </QueryClientProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
