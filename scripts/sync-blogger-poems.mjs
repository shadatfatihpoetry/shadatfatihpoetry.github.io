import { request } from 'https';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Missing Supabase environment variables.');
}

const BLOGGER_FEED =
  'https://shadatfatih.blogspot.com/feeds/posts/default?alt=json&max-results=100';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
          return;
        }

        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function htmlToText(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getAlternateUrl(entry) {
  const links = entry.link || [];
  const alternate = links.find((link) => link.rel === 'alternate');
  return alternate?.href || entry.id?.$t || '';
}

function getPublished(entry) {
  return entry.published?.$t || entry.updated?.$t || null;
}

async function fetchAllPosts() {
  const posts = [];
  let startIndex = 1;

  while (true) {
    const url =
      `https://shadatfatih.blogspot.com/feeds/posts/default` +
      `?alt=json&max-results=100&start-index=${startIndex}`;

    const feed = await get(url);
    const entries = feed.feed?.entry || [];

    if (entries.length === 0) {
      break;
    }

    posts.push(...entries);

    console.log(
      `Fetched ${entries.length} posts (start-index ${startIndex})`
    );

    if (entries.length < 100) {
      break;
    }

    startIndex += entries.length;
  }

  return posts;
}

async function upsertPosts(posts) {
  const rows = posts
    .map((entry) => {
      const title = entry.title?.$t?.trim() || 'Untitled';
      const content = htmlToText(entry.content?.$t || entry.summary?.$t || '');
      const bloggerUrl = getAlternateUrl(entry);
      const publishedAt = getPublished(entry);

      if (!bloggerUrl || !content) {
        return null;
      }

      const plainExcerpt = content
        .replace(/\\s+/g, ' ')
        .trim()
        .slice(0, 180);

      return {
        title,
        excerpt: plainExcerpt,
        content,
        published: true,
        blogger_published_at: publishedAt,
        blogger_url: bloggerUrl
      };
    })
    .filter(Boolean);

  if (rows.length === 0) {
    console.log('No valid Blogger posts found.');
    return;
  }

  const endpoint =
    `${SUPABASE_URL}/rest/v1/poems?on_conflict=blogger_url`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase error ${response.status}: ${errorText}`
    );
  }

  console.log(`Successfully synced ${rows.length} Blogger poems.`);
}

const posts = await fetchAllPosts();

console.log(`TOTAL BLOGGER POSTS FOUND: ${posts.length}`);

await upsertPosts(posts);
