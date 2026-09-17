import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Poem, Story, Novel, Chapter } from '../types';
import { INITIAL_POEMS, INITIAL_STORIES, INITIAL_NOVELS, INITIAL_CHAPTERS } from '../data/initialData';
import { adminRequest, fetchAllData, getAdminToken, isGoogleSheetsConfigured } from '../lib/googleSheets';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface DataContextType {
  poems: Poem[]; stories: Story[]; novels: Novel[]; chapters: Chapter[]; siteViews: number;
  loading: boolean; error: string | null; refreshData: () => Promise<void>;
  getPoem: (id: string) => Poem | undefined;
  createPoem: (poem: Omit<Poem, 'id'|'views'|'created_at'> & {created_at?: string}) => Promise<{success:boolean;error?:string}>;
  updatePoem: (id:string, updates:Partial<Poem>) => Promise<{success:boolean;error?:string}>;
  deletePoem: (id:string) => Promise<{success:boolean;error?:string}>;
  incrementPoemViews: (id:string) => void;
  getStory: (id:string) => Story | undefined;
  createStory: (story: Omit<Story, 'id'|'views'|'created_at'> & {created_at?: string}) => Promise<{success:boolean;error?:string}>;
  updateStory: (id:string, updates:Partial<Story>) => Promise<{success:boolean;error?:string}>;
  deleteStory: (id:string) => Promise<{success:boolean;error?:string}>;
  incrementStoryViews: (id:string) => void;
  getNovel: (id:string) => Novel | undefined;
  createNovel: (novel: Omit<Novel, 'id'|'views'|'created_at'> & {created_at?: string}) => Promise<{success:boolean;error?:string}>;
  updateNovel: (id:string, updates:Partial<Novel>) => Promise<{success:boolean;error?:string}>;
  deleteNovel: (id:string) => Promise<{success:boolean;error?:string}>;
  incrementNovelViews: (id:string) => void;
  getChaptersForNovel: (novelId:string) => Chapter[];
  getChapter: (novelId:string, chapterNumber:number) => {chapter?:Chapter;novel?:Novel;prev?:Chapter;next?:Chapter};
  createChapter: (chapter: Omit<Chapter,'id'|'views'|'created_at'> & {created_at?:string}) => Promise<{success:boolean;error?:string}>;
  updateChapter: (id:string, updates:Partial<Chapter>) => Promise<{success:boolean;error?:string}>;
  deleteChapter: (id:string) => Promise<{success:boolean;error?:string}>;
  incrementChapterViews: (id:string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const VIEWED_ITEMS_KEY = 'shadat_viewed_items_session';

function hasViewed(id:string){ try{return JSON.parse(sessionStorage.getItem(VIEWED_ITEMS_KEY)||'[]').includes(id);}catch{return false;} }
function markViewed(id:string){ try{const a=JSON.parse(sessionStorage.getItem(VIEWED_ITEMS_KEY)||'[]'); if(!a.includes(id)){a.push(id);sessionStorage.setItem(VIEWED_ITEMS_KEY,JSON.stringify(a));}}catch{} }

export function DataProvider({children}:{children:ReactNode}){
  const [poems,setPoems]=useState<Poem[]>([]), [stories,setStories]=useState<Story[]>([]), [novels,setNovels]=useState<Novel[]>([]), [chapters,setChapters]=useState<Chapter[]>([]);
  const [siteViews,setSiteViews]=useState(0), [loading,setLoading]=useState(true), [error,setError]=useState<string|null>(null);

  const loadLocal=useCallback(()=>{
    try{
      setPoems(JSON.parse(localStorage.getItem('shadat_data_poems_v2')||JSON.stringify(INITIAL_POEMS)));
      setStories(JSON.parse(localStorage.getItem('shadat_data_stories_v2')||JSON.stringify(INITIAL_STORIES)));
      setNovels(JSON.parse(localStorage.getItem('shadat_data_novels_v2')||JSON.stringify(INITIAL_NOVELS)));
      setChapters(JSON.parse(localStorage.getItem('shadat_data_chapters_v2')||JSON.stringify(INITIAL_CHAPTERS)));
      setSiteViews(Number(localStorage.getItem('shadat_site_views_v2')||12450));
    }catch{setPoems(INITIAL_POEMS);setStories(INITIAL_STORIES);setNovels(INITIAL_NOVELS);setChapters(INITIAL_CHAPTERS);setSiteViews(12450);}
  },[]);

  const refreshData=useCallback(async()=>{
    setLoading(true); setError(null);
    if(!isGoogleSheetsConfigured()){loadLocal();setLoading(false);return;}
    try{
      const d=await fetchAllData();
      setPoems(Array.isArray(d.poems)?d.poems:[]); setStories(Array.isArray(d.stories)?d.stories:[]); setNovels(Array.isArray(d.novels)?d.novels:[]); setChapters(Array.isArray(d.chapters)?d.chapters:[]); setSiteViews(Number(d.siteViews||0));
    }catch(err:any){setError(err?.message||'Google Sheets থেকে data লোড করা যায়নি।'); loadLocal();}
    finally{setLoading(false);}
  },[loadLocal]);
  useEffect(()=>{refreshData();},[refreshData]);

  const mutate=async(table:string,action:string,record:any,id?:string)=>{
    if(!getAdminToken()) return {success:false,error:'অ্যাডমিন লগইন প্রয়োজন।'};
    try{await adminRequest(action,{table,record,id});await refreshData();return {success:true};}catch(err:any){return {success:false,error:err?.message||'সংরক্ষণে সমস্যা হয়েছে।'};}
  };

  const createPoem=(d:any)=>mutate('Poems','create',{...d,id:generateUUID(),views:0,created_at:d.created_at||new Date().toISOString()});
  const updatePoem=(id:string,d:Partial<Poem>)=>mutate('Poems','update',d,id);
  const deletePoem=(id:string)=>mutate('Poems','delete',undefined,id);
  const createStory=(d:any)=>mutate('Stories','create',{...d,id:generateUUID(),views:0,created_at:d.created_at||new Date().toISOString()});
  const updateStory=(id:string,d:Partial<Story>)=>mutate('Stories','update',d,id);
  const deleteStory=(id:string)=>mutate('Stories','delete',undefined,id);
  const createNovel=(d:any)=>mutate('Novels','create',{...d,id:generateUUID(),views:0,created_at:d.created_at||new Date().toISOString()});
  const updateNovel=(id:string,d:Partial<Novel>)=>mutate('Novels','update',d,id);
  const deleteNovel=async(id:string)=>{const r=await mutate('Novels','delete',undefined,id); if(r.success){for(const c of chapters.filter(x=>x.novel_id===id)) await mutate('Chapters','delete',undefined,c.id);} return r;};
  const createChapter=(d:any)=>mutate('Chapters','create',{...d,id:generateUUID(),views:0,created_at:d.created_at||new Date().toISOString(),chapter_number:Number(d.chapter_number)});
  const updateChapter=(id:string,d:Partial<Chapter>)=>mutate('Chapters','update',{...d,chapter_number:d.chapter_number===undefined?undefined:Number(d.chapter_number)},id);
  const deleteChapter=(id:string)=>mutate('Chapters','delete',undefined,id);

  const increment=(table:string,id:string,setter:any,key:string)=>{
    if(hasViewed(id))return; markViewed(id);
    setter((prev:any[])=>prev.map(x=>x.id===id?{...x,views:Number(x.views||0)+1}:x));
    if(getAdminToken()) adminRequest('incrementView',{table,id}).catch(()=>{});
  };
  const incrementPoemViews=(id:string)=>increment('Poems',id,setPoems,'poems');
  const incrementStoryViews=(id:string)=>increment('Stories',id,setStories,'stories');
  const incrementNovelViews=(id:string)=>increment('Novels',id,setNovels,'novels');
  const incrementChapterViews=(id:string)=>increment('Chapters',id,setChapters,'chapters');

  const getPoem=useCallback((id:string)=>poems.find(x=>x.id===id),[poems]);
  const getStory=useCallback((id:string)=>stories.find(x=>x.id===id),[stories]);
  const getNovel=useCallback((id:string)=>novels.find(x=>x.id===id),[novels]);
  const getChaptersForNovel=useCallback((id:string)=>chapters.filter(x=>String(x.novel_id)===String(id)).sort((a,b)=>a.chapter_number-b.chapter_number),[chapters]);
  const getChapter=useCallback((novelId:string,num:number)=>{const novel=novels.find(x=>x.id===novelId);const list=getChaptersForNovel(novelId);const chapter=list.find(x=>x.chapter_number===num);if(!chapter)return{novel};const i=list.findIndex(x=>x.id===chapter.id);return{chapter,novel,prev:i>0?list[i-1]:undefined,next:i<list.length-1?list[i+1]:undefined};},[novels,getChaptersForNovel]);

  return <DataContext.Provider value={{poems,stories,novels,chapters,siteViews,loading,error,refreshData,getPoem,createPoem,updatePoem,deletePoem,incrementPoemViews,getStory,createStory,updateStory,deleteStory,incrementStoryViews,getNovel,createNovel,updateNovel,deleteNovel,incrementNovelViews,getChaptersForNovel,getChapter,createChapter,updateChapter,deleteChapter,incrementChapterViews}}>{children}</DataContext.Provider>;
}
export function useData(){const c=useContext(DataContext);if(!c)throw new Error('useData must be used within DataProvider');return c;}
