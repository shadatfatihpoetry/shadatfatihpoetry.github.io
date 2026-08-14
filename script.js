/* =====================================================
   SHADAT FATIH — YEARLY ARCHIVE WITH HIERARCHICAL STRUCTURE
   Year → Type (Poems/Stories/Novels) → Month → Titles
===================================================== */

"use strict";

/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  loadYearlyArchive();
  loadMostViewed();
  loadWebsiteViews();
  initReveal();
});


/* =====================================================
   MENU INITIALIZATION
===================================================== */

function initMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (!menuToggle || !mainNav) return;

  // Toggle menu on button click
  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = mainNav.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mainNav.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });

  // Initialize all toggles for menu groups
  initArchiveToggles();

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
      mainNav.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("active")) {
      mainNav.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-hidden", "true");
    }
  });
}

function initArchiveToggles() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-toggle], [data-archive-toggle]");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const toggleId = button.getAttribute("data-toggle") || button.getAttribute("data-archive-toggle");
    if (!toggleId) return;

    const target = document.getElementById(toggleId);
    if (!target) return;

    const isOpen = target.classList.toggle("open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");

    const arrow = button.querySelector(".menu-arrow");
    if (arrow) arrow.textContent = isOpen ? "−" : "+";

    target.style.display = isOpen ? "block" : "none";
  });
}


/* =====================================================
   UTILITY FUNCTIONS
===================================================== */

function escapeHtml(value) {
  if (!value) return "";
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";
  
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("bn-BD", options);
}

function getMonth(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? null : date.getMonth();
}

function getYear(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? null : date.getFullYear();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function typeLabel(type) {
  const labels = { poem: "Poems", story: "Stories", novel: "Novels" };
  return labels[type] || type;
}

function getContentUrl(type, id) {
  const paths = {
    poem: "poem.html",
    story: "story.html",
    novel: "novel.html"
  };
  const basePath = paths[type] || "index.html";
  return `${basePath}?id=${encodeURIComponent(id)}`;
}


/* =====================================================
   YEARLY ARCHIVE
   Structure: Year → Type → Month → Titles
===================================================== */

async function loadYearlyArchive() {
  const container = document.getElementById("archiveYears");
  if (!container) return;

  try {
    // Fetch all published content
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

    // Organize data: Year → Type → Month → Items
    const yearMap = {};
    const allData = {
      poem: poemsRes.data || [],
      story: storiesRes.data || [],
      novel: novelsRes.data || []
    };

    Object.entries(allData).forEach(([type, items]) => {
      items.forEach((item) => {
        const year = getYear(item.created_at);
        const month = getMonth(item.created_at);

        if (year === null || month === null) return;

        if (!yearMap[year]) {
          yearMap[year] = { poem: {}, story: {}, novel: {} };
        }
        if (!yearMap[year][type][month]) {
          yearMap[year][type][month] = [];
        }

        yearMap[year][type][month].push(item);
      });
    });

    // Sort years in descending order
    const years = Object.keys(yearMap)
      .map(Number)
      .sort((a, b) => b - a);

    if (years.length === 0) {
      container.innerHTML = '<p class="archive-empty">No published content yet.</p>';
      return;
    }

    // Render years
    container.innerHTML = years.map((year) => renderYear(year, yearMap[year])).join("");

  } catch (error) {
    console.error("Archive Load Error:", error);
    container.innerHTML = '<p class="archive-error">Failed to load archive.</p>';
  }
}

function renderYear(year, typeMap) {
  const types = ["poem", "story", "novel"];
  const typeHasContent = types.some((type) => Object.keys(typeMap[type]).length > 0);

  if (!typeHasContent) return "";

  const typeContent = types
    .map((type) => {
      if (Object.keys(typeMap[type]).length === 0) return "";
      return renderType(year, type, typeMap[type]);
    })
    .join("");

  return `
    <div class="archive-year">
      <button
        type="button"
        class="archive-year-btn"
        data-archive-toggle="archive-year-${year}"
        aria-expanded="false"
      >
        <span class="archive-year-label">${year}</span>
        <span class="menu-arrow">+</span>
      </button>

      <div id="archive-year-${year}" class="archive-year-content">
        ${typeContent}
      </div>
    </div>
  `;
}

function renderType(year, type, monthMap) {
  const label = typeLabel(type);
  const months = Object.keys(monthMap)
    .map(Number)
    .sort((a, b) => b - a);

  const monthContent = months
    .map((month) => renderMonth(year, type, month, monthMap[month]))
    .join("");

  return `
    <div class="archive-type">
      <button
        type="button"
        class="archive-type-btn"
        data-archive-toggle="archive-type-${year}-${type}"
        aria-expanded="false"
      >
        <span class="archive-type-label">${label}</span>
        <span class="menu-arrow">+</span>
      </button>

      <div id="archive-type-${year}-${type}" class="archive-type-content">
        ${monthContent}
      </div>
    </div>
  `;
}

function renderMonth(year, type, month, items) {
  const monthName = MONTHS[month];
  const monthId = `archive-month-${year}-${type}-${month}`;

  const itemsHtml = items
    .map((item) => {
      const url = getContentUrl(type, item.id);
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
        data-archive-toggle="${monthId}"
        aria-expanded="false"
      >
        <span class="archive-month-label">${monthName}</span>
        <span class="menu-arrow">+</span>
      </button>

      <div id="${monthId}" class="archive-month-content">
        ${itemsHtml}
      </div>
    </div>
  `;
}


/* =====================================================
   MOST VIEWED
===================================================== */

async function loadMostViewed() {
  const poemContainer = document.getElementById("most-poems-folder");
  const storyContainer = document.getElementById("most-stories-folder");
  const novelContainer = document.getElementById("most-novels-folder");

  if (!poemContainer && !storyContainer && !novelContainer) return;

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

    renderMostMenu(poemContainer, poemsRes.data || [], "poem");
    renderMostMenu(storyContainer, storiesRes.data || [], "story");
    renderMostMenu(novelContainer, novelsRes.data || [], "novel");

  } catch (error) {
    console.error("Most Viewed Error:", error);
  }
}

function renderMostMenu(container, items, type) {
  if (!container) return;

  if (!items.length) {
    container.innerHTML = '<p>No content yet.</p>';
    return;
  }

  container.innerHTML = items
    .map((item, idx) => {
      const url = getContentUrl(type, item.id);
      const views = Number(item.views || 0).toLocaleString("en-US");
      const rank = String(idx + 1).padStart(2, "0");

      return `
        <a href="${url}" class="menu-most-viewed-item">
          <span class="most-rank">${rank}</span>
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
      const views = Number(data.views || 0).toLocaleString("en-US");
      element.textContent = views;
    } else {
      element.textContent = "0";
    }
  } catch (error) {
    console.warn("Website Views Error:", error);
    element.textContent = "0";
  }
}


/* =====================================================
   REVEAL ANIMATION
===================================================== */

function initReveal() {
  // Simple reveal animation for content
  const reveals = document.querySelectorAll(".reveal");
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.1 }
  );

  reveals.forEach((el) => observer.observe(el));
}
