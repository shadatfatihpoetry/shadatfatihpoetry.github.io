/* =====================================================
   SHADAT FATIH YEARLY ARCHIVE
   নতুন স্ট্রাকচার: Year → Type → Month → Titles
===================================================== */

"use strict";

/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initArchiveMenu();
  loadYearlyArchive();
  loadMostViewed();
  loadWebsiteViews();
});


/* =====================================================
   ARCHIVE MENU TOGGLE
===================================================== */

function initArchiveMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (!menuToggle || !mainNav) return;

  menuToggle.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = mainNav.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mainNav.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });

  /* YEARLY ARCHIVE TOGGLE */
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

  /* ARCHIVE ITEM TOGGLES */
  document.addEventListener("click", event => {
    const btn = event.target.closest("[data-archive-toggle]");
    if (!btn) return;

    const toggleId = btn.getAttribute("data-archive-toggle");
    const target = document.getElementById(toggleId);
    if (!target) return;

    event.preventDefault();
    event.stopPropagation();

    const isOpen = target.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");

    const arrow = btn.querySelector(".menu-arrow");
    if (arrow) arrow.textContent = isOpen ? "−" : "+";

    target.style.display = isOpen ? "block" : "";
  });

  /* CLOSE OUTSIDE */
  document.addEventListener("click", event => {
    if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
      mainNav.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
    }
  });

  /* ESCAPE KEY */
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      mainNav.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
    }
  });
}


/* =====================================================
   UTILITY FUNCTIONS
===================================================== */

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getYear(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
}

function getMonth(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date.getMonth();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];


/* =====================================================
   YEARLY ARCHIVE
   Structure: Year → Type → Month → Titles
===================================================== */

async function loadYearlyArchive() {
  const container = document.getElementById("archiveYears");
  if (!container) return;

  try {
    const [poemsRes, storiesRes, novelsRes] = await Promise.all([
      window.supabaseClient
        .from("poems")
        .select("id,title,created_at,published")
        .eq("published", true),
      window.supabaseClient
        .from("stories")
        .select("id,title,created_at,published")
        .eq("published", true),
      window.supabaseClient
        .from("novels")
        .select("id,title,created_at,published")
        .eq("published", true)
    ]);

    if (poemsRes.error) throw poemsRes.error;
    if (storiesRes.error) throw storiesRes.error;
    if (novelsRes.error) throw novelsRes.error;

    const allData = {
      poem: poemsRes.data || [],
      story: storiesRes.data || [],
      novel: novelsRes.data || []
    };

    /* Organize by Year → Type → Month */
    const yearMap = {};

    Object.entries(allData).forEach(([type, items]) => {
      items.forEach(item => {
        const year = getYear(item.created_at);
        const month = getMonth(item.created_at);

        if (year === null || month === null) return;

        if (!yearMap[year]) yearMap[year] = { poem: {}, story: {}, novel: {} };
        if (!yearMap[year][type][month]) yearMap[year][type][month] = [];

        yearMap[year][type][month].push(item);
      });
    });

    /* Sort years descending */
    const years = Object.keys(yearMap)
      .map(Number)
      .sort((a, b) => b - a);

    if (!years.length) {
      container.innerHTML = `<p>No published content yet.</p>`;
      return;
    }

    /* Render years */
    container.innerHTML = years
      .map(year => renderYear(year, yearMap[year]))
      .join("");

  } catch (error) {
    console.error("Archive Error:", error);
    container.innerHTML = `<p>Failed to load archive.</p>`;
  }
}


/* =====================================================
   RENDER YEAR
===================================================== */

function renderYear(year, typeMap) {
  const types = ["poem", "story", "novel"];
  const typeLabels = { poem: "Poems", story: "Stories", novel: "Novels" };

  let typeContent = "";
  types.forEach(type => {
    if (Object.keys(typeMap[type]).length > 0) {
      typeContent += renderType(year, type, typeMap[type], typeLabels[type]);
    }
  });

  return `
    <div class="archive-year">
      <button
        type="button"
        class="archive-year-btn"
        data-archive-toggle="archive-year-${year}"
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
}


/* =====================================================
   RENDER TYPE (Poems/Stories/Novels)
===================================================== */

function renderType(year, type, monthMap, label) {
  const months = Object.keys(monthMap)
    .map(Number)
    .sort((a, b) => b - a);

  const monthContent = months
    .map(month => renderMonth(year, type, month, monthMap[month]))
    .join("");

  return `
    <div class="archive-type">
      <button
        type="button"
        class="archive-type-btn"
        data-archive-toggle="archive-type-${year}-${type}"
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
   RENDER MONTH
===================================================== */

function renderMonth(year, type, month, items) {
  const monthName = MONTHS[month];

  const itemsHtml = items
    .map(item => {
      const url = `${type}.html?id=${encodeURIComponent(item.id)}`;
      return `
        <a href="${url}" class="archive-item">
          ${escapeHtml(item.title)}
        </a>
      `;
    })
    .join("");

  return `
    <div class="archive-month">
      <button
        type="button"
        class="archive-month-btn"
        data-archive-toggle="archive-month-${year}-${type}-${month}"
        aria-expanded="false"
      >
        <span>${monthName}</span>
        <span class="menu-arrow">+</span>
      </button>

      <div id="archive-month-${year}-${type}-${month}" class="archive-month-content">
        ${itemsHtml}
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
    const [poemsRes, storiesRes, novelsRes] = await Promise.all([
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

    if (poemsRes.error) throw poemsRes.error;
    if (storiesRes.error) throw storiesRes.error;
    if (novelsRes.error) throw novelsRes.error;

    renderMostViewedFolder(poemFolder, poemsRes.data || [], "poem");
    renderMostViewedFolder(storyFolder, storiesRes.data || [], "story");
    renderMostViewedFolder(novelFolder, novelsRes.data || [], "novel");

  } catch (error) {
    console.error("Most Viewed Error:", error);
  }
}

function renderMostViewedFolder(container, data, type) {
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `<p>No content yet.</p>`;
    return;
  }

  container.innerHTML = data
    .map((item, idx) => {
      const url = `${type}.html?id=${encodeURIComponent(item.id)}`;
      const views = Number(item.views || 0).toLocaleString("en-US");
      return `
        <a href="${url}" class="menu-most-viewed-item">
          <span class="most-rank">${String(idx + 1).padStart(2, "0")}</span>
          <span class="most-title">${escapeHtml(item.title)}</span>
          <span class="most-views">◉ ${views}</span>
        </a>
      `;
    })
    .join("");
}


/* =====================================================
   WEBSITE VIEWS
===================================================== */

async function loadWebsiteViews() {
  const element = document.getElementById("totalWebsiteViews");
  if (!element) return;

  try {
    const { data } = await window.supabaseClient
      .from("site_views")
      .select("views")
      .eq("id", 1)
      .maybeSingle();

    if (data) {
      element.textContent = Number(data.views || 0).toLocaleString("en-US");
    }
  } catch (error) {
    console.warn("Views Error:", error);
  }
}
