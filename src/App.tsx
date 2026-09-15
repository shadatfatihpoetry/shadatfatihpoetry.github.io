import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ActivePage } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { SupabaseSetupModal } from './pages/admin/SupabaseSetupModal';

// Pages
import { HomePage } from './pages/HomePage';
import { PoemsPage } from './pages/PoemsPage';
import { ArchivePage } from './pages/ArchivePage';
import { PoemReadingPage } from './pages/PoemReadingPage';
import { StoriesPage } from './pages/StoriesPage';
import { StoryReadingPage } from './pages/StoryReadingPage';
import { NovelsPage } from './pages/NovelsPage';
import { NovelDetailPage } from './pages/NovelDetailPage';
import { ChapterReadingPage } from './pages/ChapterReadingPage';
import { AuthorPage } from './pages/AuthorPage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';

function parseUrlToActivePage(path: string): ActivePage {
  const clean = path.replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '') return { type: 'home' };
  if (clean === '/poems') return { type: 'poems' };
  if (clean === '/archive') return { type: 'archive' };
  if (clean.startsWith('/poem/')) {
    const id = clean.replace('/poem/', '');
    return { type: 'poem-detail', id };
  }
  if (clean === '/stories') return { type: 'stories' };
  if (clean.startsWith('/story/')) {
    const id = clean.replace('/story/', '');
    return { type: 'story-detail', id };
  }
  if (clean === '/novels') return { type: 'novels' };

  // Chapter reading: /novel/:novelId/chapter/:number
  const chapterMatch = clean.match(/^\/novel\/([^/]+)\/chapter\/(\d+)$/);
  if (chapterMatch) {
    return {
      type: 'chapter-detail',
      novelId: chapterMatch[1],
      chapterNumber: parseInt(chapterMatch[2], 10),
    };
  }

  // Novel detail: /novel/:id
  if (clean.startsWith('/novel/')) {
    const id = clean.replace('/novel/', '');
    return { type: 'novel-detail', id };
  }

  if (clean === '/author') return { type: 'author' };
  if (clean === '/about') return { type: 'about' };
  if (clean === '/admin') return { type: 'admin' };
  if (clean === '/admin/login') return { type: 'admin-login' };

  return { type: 'home' };
}

function pageToUrl(page: ActivePage): string {
  switch (page.type) {
    case 'home':
      return '/';
    case 'poems':
      return '/poems';
    case 'archive':
      return '/archive';
    case 'poem-detail':
      return `/poem/${page.id}`;
    case 'stories':
      return '/stories';
    case 'story-detail':
      return `/story/${page.id}`;
    case 'novels':
      return '/novels';
    case 'novel-detail':
      return `/novel/${page.id}`;
    case 'chapter-detail':
      return `/novel/${page.novelId}/chapter/${page.chapterNumber}`;
    case 'author':
      return '/author';
    case 'about':
      return '/about';
    case 'admin':
      return '/admin';
    case 'admin-login':
      return '/admin/login';
    default:
      return '/';
  }
}

function MainApp() {
  const { isAdmin, loading } = useAuth();
  const [activePage, setActivePage] = useState<ActivePage>(() =>
    parseUrlToActivePage(window.location.pathname)
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);

  // Sync browser popstate (Back/Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setActivePage(parseUrlToActivePage(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Custom navigation handler that updates both URL and state
  const handleNavigate = useCallback((newPage: ActivePage) => {
    setActivePage(newPage);
    const newUrl = pageToUrl(newPage);
    if (window.location.pathname !== newUrl) {
      window.history.pushState({}, '', newUrl);
    }
  }, []);

  // Render Page Content
  const renderContent = () => {
    switch (activePage.type) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'poems':
        return <PoemsPage onNavigate={handleNavigate} />;
      case 'archive':
        return <ArchivePage onNavigate={handleNavigate} />;
      case 'poem-detail':
        return <PoemReadingPage id={activePage.id} onNavigate={handleNavigate} />;
      case 'stories':
        return <StoriesPage onNavigate={handleNavigate} />;
      case 'story-detail':
        return <StoryReadingPage id={activePage.id} onNavigate={handleNavigate} />;
      case 'novels':
        return <NovelsPage onNavigate={handleNavigate} />;
      case 'novel-detail':
        return <NovelDetailPage id={activePage.id} onNavigate={handleNavigate} />;
      case 'chapter-detail':
        return (
          <ChapterReadingPage
            novelId={activePage.novelId}
            chapterNumber={activePage.chapterNumber}
            onNavigate={handleNavigate}
          />
        );
      case 'author':
        return <AuthorPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'admin':
        if (loading) {
          return (
            <div className="py-24 text-center text-sm font-serif text-[#7A7167]">
              অ্যাডমিন যাচাই করা হচ্ছে...
            </div>
          );
        }
        if (!isAdmin) {
          return (
            <AdminLogin
              onNavigate={handleNavigate}
              onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
            />
          );
        }
        return (
          <AdminDashboard
            onNavigate={handleNavigate}
            onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
          />
        );
      case 'admin-login':
        if (loading) {
          return (
            <div className="py-24 text-center text-sm font-serif text-[#7A7167]">
              অ্যাডমিন যাচাই করা হচ্ছে...
            </div>
          );
        }
        if (isAdmin) {
          return (
            <AdminDashboard
              onNavigate={handleNavigate}
              onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
            />
          );
        }
        return (
          <AdminLogin
            onNavigate={handleNavigate}
            onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
          />
        );
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#121110] text-[#1F1C1A] dark:text-[#F3EFEB] transition-colors duration-200">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="grow animate-fade-in">{renderContent()}</main>

      <Footer onNavigate={handleNavigate} />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(type, id) => {
          if (type === 'poem-detail') handleNavigate({ type: 'poem-detail', id });
          else if (type === 'story-detail') handleNavigate({ type: 'story-detail', id });
          else if (type === 'novel-detail') handleNavigate({ type: 'novel-detail', id });
        }}
      />

      {/* Supabase Setup Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseSetupOpen}
        onClose={() => setIsSupabaseSetupOpen(false)}
        onReload={() => window.location.reload()}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
