/* =====================================================
   SHADAT FATIH LITERARY ARCHIVE
   COMPLETE RESTRUCTURED - নতুন হায়ারার্কি
   বছর → ধরন → মাস → লেখা
===================================================== */

"use strict";


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  initMenu();
  initYear();

  loadPoetry();
  loadStories();
  loadNovels();

  loadYearlyArchive();
  loadMostViewed();

  loadWebsiteViews();

  initReveal();

});


/* =====================================================
   MENU
===================================================== */

function initMenu() {

  const menuToggle =
    document.getElementById("menuToggle");

  const mainNav =
    document.getElementById("mainNav");

  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = mainNav.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mainNav.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });

  mainNav.querySelectorAll(".menu-group-title[data-toggle]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const targetId = button.getAttribute("data-toggle");
      const target = document.getElementById(targetId);
      if (!target) return;

      const isOpen = target.classList.toggle("open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      const arrow = button.querySelector(".menu-arrow");
      if (arrow) arrow.textContent = isOpen ? "−" : "+";
      target.style.display = isOpen ? "block" : "";
    });
  });

  document.addEventListener("click", event => {
    const btn = event.target.closest("[data-toggle-id]");
    if (!btn) return;

    const toggleId = btn.getAttribute("data-toggle-id");
    const target = document.getElementById(toggleId);
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();

    const isOpen = target.classList.toggle("active");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    const arrow = btn.querySelector(".menu-arrow");
    if (arrow) arrow.textContent = isOpen ? "−" : "+";
    target.style.display = isOpen ? "block" : "";
  });

  mainNav.querySelectorAll(".menu-main-links a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
    });
  });

  document.addEventListener("click", event => {
    if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
      mainNav.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      mainNav.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
    }
  });

}


/* =====================================================
   YEAR
===================================================== */

function initYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}


/* =====================================================
   SECURITY
===================================================== */

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =====================================================
   DATE FUNCTIONS
===================================================== */

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getMonth(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.getMonth();
}

function getYear(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}


/* =====================================================
   ENGLISH MONTHS
===================================================== */

const ENGLISH_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


/* =====================================================
   TYPE LABEL
===================================================== */

function typeLabel(type) {
  if (type === "poem") return "কবিতা";
  if (type === "story") return "গল্প";
  if (type === "novel") return "উপন্যাস";
  return "";
}


/* =====================================================
   TYPE URL
===================================================== */

function typeUrl(type, id) {
  return `${type}.html?id=${encodeURIComponent(id)}`;
}


/* =====================================================
   CONTENT URL
===================================================== */

function getContentUrl(type, id) {
  const base = window.location.href.split("#")[0].split("?")[0];
  const directory = base.substring(0, base.lastIndexOf("/") + 1);
  return directory + `${type}.html?id=${encodeURIComponent(id)}`;
}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {
  let toast = document.getElementById("sf-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "sf-toast";
    toast.className = "sf-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.sfToastTimer);
  window.sfToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =====================================================
   COPY LINK
===================================================== */

async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    showToast("লিংক কপি হয়েছে");
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast("লিংক কপি হয়েছে");
  }
}


/* =====================================================
   SHARE
===================================================== */

async function shareContent(title, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch (error) { }
    return;
  }
  await copyLink(url);
}


/* =====================================================
   COMMENT
===================================================== */

function openComment(type, id) {
  const url = `${type}.html?id=${encodeURIComponent(id)}#comments`;
  window.location.href = url;
}


/* =====================================================
   VIEWS DISPLAY
===================================================== */

function totalViews(item) {
  const views = Number(item?.views || 0);
  return `
    <div class="total-views">
      <span class="views-icon">◉</span>
      <span>${views.toLocaleString("en-US")}</span>
    </div>
  `;
}


/* =====================================================
   ACTION BUTTONS
===================================================== */

function actionButtons(type, id, title) {
  const url = getContentUrl(type, id);
  return `
    <div class="writing-actions">
      <button type="button" class="action-btn" onclick="openComment('${escapeHtml(type)}', '${escapeHtml(id)}')" title="Comment">
        <span>◌</span>
        <small>Comment</small>
      </button>

      <button type="button" class="action-btn" onclick="shareContent(${JSON.stringify(title)}, ${JSON.stringify(url)})" title="Share">
        <span>↗</span>
        <small>Share</small>
      </button>

      <button type="button" class="action-btn" onclick="copyLink(${JSON.stringify(url)})" title="Copy Link">
        <span>⛓</span>
        <small>Copy</small>
      </button>
    </div>
  `;
}


/* =====================================================
   POETRY
===================================================== */

async function loadPoetry() {
  const container = document.getElementById("poetry-list");
  if (!container) return;

  try {
    const { data, error } = await window.supabaseClient
      .from("poems")
      .select("id,title,content,excerpt,created_at,published,views")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty-card">
          <span>POETRY</span>
          <h3>শীঘ্রই আসছে</h3>
          <p>নতুন কবিতা খুব শীঘ্রই প্রকাশিত হবে।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.map((poem, index) => `
      <article class="writing-card">
        <div class="card-number">${String(index + 1).padStart(2, "0")}</div>
        <div class="writing-card-content">
          <div class="published-date">${formatDate(poem.created_at)}</div>
          <p class="card-label">POETRY</p>
          <h3>${escapeHtml(poem.title)}</h3>
          ${poem.excerpt ? `<p class="writing-excerpt">${escapeHtml(poem.excerpt)}</p>` : ""}
          ${totalViews(poem)}
          <a href="${typeUrl("poem", poem.id)}" class="text-link">কবিতা পড়ুন →</a>
          ${actionButtons("poem", poem.id, poem.title)}
        </div>
      </article>
    `).join("");

  } catch (error) {
    console.error("Poetry Error:", error);
    container.innerHTML = `
      <div class="error-card">
        <span>POETRY</span>
        <h3>কবিতা লোড করা যায়নি</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}


/* =====================================================
   STORIES
===================================================== */

async function loadStories() {
  const container = document.getElementById("stories-container");
  if (!container) return;

  try {
    const { data, error } = await window.supabaseClient
      .from("stories")
      .select("id,title,excerpt,content,created_at,published,views")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="story-card empty-card">
          <span>STORIES</span>
          <h3>কোনো প্রকাশিত গল্প নেই</h3>
          <p>নতুন গল্প খুব শীঘ্রই প্রকাশিত হবে।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.map((story, index) => `
      <article class="story-card">
        <div class="published-date">${formatDate(story.created_at)}</div>
        <span>STORY ${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(story.title)}</h3>
        ${story.excerpt ? `<p>${escapeHtml(story.excerpt)}</p>` : ""}
        ${totalViews(story)}
        <a href="${typeUrl("story", story.id)}" class="text-link">গল্প পড়ুন ↗</a>
        ${actionButtons("story", story.id, story.title)}
      </article>
    `).join("");

  } catch (error) {
    console.error("Stories Error:", error);
    container.innerHTML = `
      <div class="story-card error-card">
        <span>STORIES</span>
        <h3>গল্প লোড করা যায়নি</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}


/* =====================================================
   NOVELS
===================================================== */

async function loadNovels() {
  const container = document.getElementById("novels-container");
  if (!container) return;

  try {
    const { data, error } = await window.supabaseClient
      .from("novels")
      .select("id,title,content,excerpt,created_at,published,views")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="novel-card empty-card">
          <p class="card-label">NOVELS</p>
          <h3>শীঘ্রই আসছে</h3>
          <p>নতুন উপন্যাস খুব শীঘ্রই প্রকাশিত হবে।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.map((novel, index) => `
      <article class="novel-card">
        <div class="novel-info">
          <div class="published-date">${formatDate(novel.created_at)}</div>
          <p class="card-label">NOVEL ${String(index + 1).padStart(2, "0")}</p>
          <h3>${escapeHtml(novel.title)}</h3>
          ${novel.excerpt ? `<p>${escapeHtml(novel.excerpt)}</p>` : ""}
          ${totalViews(novel)}
          <a href="${typeUrl("novel", novel.id)}" class="text-link">উপন্যাস পড়ুন →</a>
          ${actionButtons("novel", novel.id, novel.title)}
        </div>
      </article>
    `).join("");

  } catch (error) {
    console.error("Novels Error:", error);
    container.innerHTML = `
      <div class="novel-card error-card">
        <p class="card-label">NOVELS</p>
        <h3>উপন্যাস লোড করা যায়নি</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}


/* =====================================================
   YEARLY ARCHIVE
   নতুন হায়ারার্কি: বছর → ধরন (Poems/Stories/Novels) → মাস → টাইটেল
===================================================== */

async function loadYearlyArchive() {
  const container = document.getElementById("archiveYears");
  if (!container) return;

  try {
    const [poemsResult, storiesResult, novelsResult] = await Promise.all([
      window.supabaseClient
        .from("poems")
        .select("id,title,created_at,published")
        .eq("published", true)
        .order("created_at", { ascending: false }),

      window.supabaseClient
        .from("stories")
        .select("id,title,created_at,published")
        .eq("published", true)
        .order("created_at", { ascending: false }),

      window.supabaseClient
        .from("novels")
        .select("id,title,created_at,published")
        .eq("published", true)
        .order("created_at", { ascending: false })
    ]);

    if (poemsResult.error) throw poemsResult.error;
    if (storiesResult.error) throw storiesResult.error;
    if (novelsResult.error) throw novelsResult.error;

    const allItems = [
      ...(poemsResult.data || []).map(item => ({ ...item, type: "poem" })),
      ...(storiesResult.data || []).map(item => ({ ...item, type: "story" })),
      ...(novelsResult.data || []).map(item => ({ ...item, type: "novel" }))
    ];

    if (!allItems.length) {
      container.innerHTML = `<p>এখনো কোনো প্রকাশিত লেখা নেই।</p>`;
      return;
    }

    /* বছর এবং ধরন অনুযায়ী সংগঠিত করুন */

    const yearData = {};

    allItems.forEach(item => {
      const year = getYear(item.created_at);
      if (year === null) return;

      if (!yearData[year]) {
        yearData[year] = { poem: {}, story: {}, novel: {} };
      }

      const month = getMonth(item.created_at);
      if (month === null) return;

      if (!yearData[year][item.type][month]) {
        yearData[year][item.type][month] = [];
      }

      yearData[year][item.type][month].push(item);
    });

    /* বছর সর্বোচ্চ থেকে নিম্নতম অনুযায়ী সাজান */

    const sortedYears = Object.keys(yearData)
      .map(Number)
      .sort((a, b) => b - a);

    /* HTML তৈরি করুন */

    container.innerHTML = sortedYears
      .map(year => {
        const typeData = yearData[year];

        let typeContent = "";

        // POEMS
        if (Object.keys(typeData.poem).length > 0) {
          typeContent += renderArchiveType(
            year,
            "poem",
            typeData.poem,
            "Poems"
          );
        }

        // STORIES
        if (Object.keys(typeData.story).length > 0) {
          typeContent += renderArchiveType(
            year,
            "story",
            typeData.story,
            "Stories"
          );
        }

        // NOVELS
        if (Object.keys(typeData.novel).length > 0) {
          typeContent += renderArchiveType(
            year,
            "novel",
            typeData.novel,
            "Novels"
          );
        }

        return `
          <div class="archive-year-wrapper">
            <button
              type="button"
              class="archive-year-btn"
              data-toggle-id="archive-year-${year}"
              aria-expanded="false"
            >
              <span>${year}</span>
              <span class="menu-arrow">+</span>
            </button>

            <div id="archive-year-${year}" class="archive-year-content">
              ${typeContent}
            </div>
          </div>
        `;
      })
      .join("");

  } catch (error) {
    console.error("Yearly Archive Error:", error);
    container.innerHTML = `<p>Archive লোড করা যায়নি: ${escapeHtml(error.message)}</p>`;
  }
}


/* =====================================================
   RENDER ARCHIVE TYPE
   ধরন (Poems/Stories/Novels) → মাস → টাইটেল
===================================================== */

function renderArchiveType(year, type, monthData, label) {

  const sortedMonths = Object.keys(monthData)
    .map(Number)
    .sort((a, b) => b - a);

  const monthContent = sortedMonths
    .map(month => {
      const items = monthData[month];
      const monthName = ENGLISH_MONTHS[month];

      return `
        <div class="archive-month-wrapper">
          <button
            type="button"
            class="archive-month-btn"
            data-toggle-id="archive-month-${year}-${type}-${month}"
            aria-expanded="false"
          >
            <span>${monthName}</span>
            <span class="menu-arrow">+</span>
          </button>

          <div id="archive-month-${year}-${type}-${month}" class="archive-month-content">
            ${items.map(item => `
              <a href="${typeUrl(type, item.id)}" class="archive-item-link">
                ${escapeHtml(item.title)}
              </a>
            `).join("")}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="archive-type-wrapper">
      <button
        type="button"
        class="archive-type-btn"
        data-toggle-id="archive-type-${year}-${type}"
        aria-expanded="false"
      >
        <span>${label}</span>
        <span class="menu-arrow">+</span>
      </button>

      <div id="archive-type-${year}-${type}" class="archive-type-content">
        ${monthContent}
      </div>
    </div>
  `;
}


/* =====================================================
   MOST VIEWED
===================================================== */

async function loadMostViewed() {
  const poemFolder = document.getElementById("most-poems-folder");
  const storyFolder = document.getElementById("most-stories-folder");
  const novelFolder = document.getElementById("most-novels-folder");

  if (!poemFolder && !storyFolder && !novelFolder) return;

  try {
    const [poemsResult, storiesResult, novelsResult] = await Promise.all([
      window.supabaseClient
        .from("poems")
        .select("id,title,views")
        .eq("published", true)
        .order("views", { ascending: false, nullsFirst: false })
        .limit(5),

      window.supabaseClient
        .from("stories")
        .select("id,title,views")
        .eq("published", true)
        .order("views", { ascending: false, nullsFirst: false })
        .limit(5),

      window.supabaseClient
        .from("novels")
        .select("id,title,views")
        .eq("published", true)
        .order("views", { ascending: false, nullsFirst: false })
        .limit(5)
    ]);

    if (poemsResult.error) throw poemsResult.error;
    if (storiesResult.error) throw storiesResult.error;
    if (novelsResult.error) throw novelsResult.error;

    renderMostViewedFolder(poemFolder, poemsResult.data || [], "poem");
    renderMostViewedFolder(storyFolder, storiesResult.data || [], "story");
    renderMostViewedFolder(novelFolder, novelsResult.data || [], "novel");

  } catch (error) {
    console.error("Most Viewed Error:", error);
    if (poemFolder) poemFolder.innerHTML = "<p>লোড করা যায়নি।</p>";
    if (storyFolder) storyFolder.innerHTML = "<p>লোড করা যায়নি।</p>";
    if (novelFolder) novelFolder.innerHTML = "<p>লোড করা যায়নি।</p>";
  }
}


/* =====================================================
   RENDER MOST VIEWED FOLDER
===================================================== */

function renderMostViewedFolder(container, data, type) {
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `<p>এখনো কোনো লেখা নেই।</p>`;
    return;
  }

  container.innerHTML = data
    .map((item, index) => `
      <a href="${typeUrl(type, item.id)}" class="menu-most-viewed-item" title="${escapeHtml(item.title)}">
        <span class="most-rank">${String(index + 1).padStart(2, "0")}</span>
        <span class="most-title">${escapeHtml(item.title)}</span>
        <span class="most-views">◉ ${Number(item.views || 0).toLocaleString("en-US")}</span>
      </a>
    `)
    .join("");
}


/* =====================================================
   WEBSITE TOTAL VIEWS
===================================================== */

async function loadWebsiteViews() {
  const element = document.getElementById("totalWebsiteViews");
  if (!element) return;

  try {
    const { data, error } = await window.supabaseClient
      .from("site_views")
      .select("views")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.warn("Website Views:", error.message);
      return;
    }

    if (data) {
      element.textContent = Number(data.views || 0).toLocaleString("en-US");
    }

  } catch (error) {
    console.warn("Website Views Error:", error);
  }
}


/* =====================================================
   SCROLL REVEAL
===================================================== */

function initReveal() {
  const elements = document.querySelectorAll(
    ".intro-inner, .writing-card, .story-card, .novel-card, .quote-container, .author-grid"
  );

  if (!("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  elements.forEach(element => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.copyLink = copyLink;
window.shareContent = shareContent;
window.openComment = openComment;
