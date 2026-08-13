"use strict";


/* =====================================================
   SHADAT FATIH
   MAIN SCRIPT.JS
===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://ooxbtwxqumaixvrwsllg.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_dNAV-kJ5rv_-BH6GhChYVg_1xbRUNdy";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatPublishedDate(dateValue) {

  if (!dateValue) {
    return "Published date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Published date unavailable";
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).toUpperCase();

}


function getPublishedYear(dateValue) {

  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getFullYear();

}


/* =====================================================
   URL
===================================================== */

function getAbsoluteUrl(path) {

  return new URL(
    path,
    window.location.href
  ).href;

}


function getWritingUrl(type, id) {

  const pages = {
    poem: "poem.html",
    story: "story.html",
    novel: "novel.html"
  };

  const page = pages[type];

  if (!page) {
    return window.location.href;
  }

  return getAbsoluteUrl(
    `${page}?id=${encodeURIComponent(id)}`
  );

}


/* =====================================================
   COPY LINK
===================================================== */

async function copyWritingLink(type, id, button) {

  const url =
    getWritingUrl(type, id);

  try {

    await navigator.clipboard.writeText(url);

    const originalText =
      button.innerHTML;

    button.innerHTML =
      "✓ Copied";

    setTimeout(() => {

      button.innerHTML =
        originalText;

    }, 1800);

  } catch (error) {

    console.error(
      "Copy link error:",
      error
    );

    window.prompt(
      "Copy this link:",
      url
    );

  }

}


/* =====================================================
   SHARE
===================================================== */

async function shareWriting(
  type,
  id,
  title,
  button
) {

  const url =
    getWritingUrl(type, id);

  const shareData = {

    title:
      title || "Shadat Fatih",

    text:
      `${title || "একটি লেখা"} — Shadat Fatih`,

    url

  };


  if (
    navigator.share &&
    typeof navigator.share === "function"
  ) {

    try {

      await navigator.share(
        shareData
      );

      return;

    } catch (error) {

      if (
        error &&
        error.name === "AbortError"
      ) {
        return;
      }

    }

  }


  await copyWritingLink(
    type,
    id,
    button
  );

}


/* =====================================================
   COMMENT
===================================================== */

function openComment(type, id) {

  const url =
    getWritingUrl(type, id);

  /*
    Comment system will live on the
    individual poem/story/novel page.

    The #comments anchor allows the
    reader to jump directly there.
  */

  window.location.href =
    `${url}#comments`;

}


/* =====================================================
   ACTION BUTTONS
===================================================== */

function createWritingActions(
  type,
  id,
  title
) {

  return `

    <div
      class="writing-actions"
      aria-label="Writing actions"
    >

      <button
        type="button"
        class="writing-action"
        onclick="openComment(
          '${escapeHtml(type)}',
          '${escapeHtml(id)}'
        )"
      >
        Comment
      </button>


      <button
        type="button"
        class="writing-action"
        onclick="copyWritingLink(
          '${escapeHtml(type)}',
          '${escapeHtml(id)}',
          this
        )"
      >
        Copy Link
      </button>


      <button
        type="button"
        class="writing-action"
        onclick="shareWriting(
          '${escapeHtml(type)}',
          '${escapeHtml(id)}',
          '${escapeHtml(title)}',
          this
        )"
      >
        Share
      </button>

    </div>

  `;

}


/* =====================================================
   MENU
===================================================== */

function initializeMenu() {

  const menuToggle =
    document.getElementById(
      "menuToggle"
    );

  const mainNav =
    document.getElementById(
      "mainNav"
    );


  if (!menuToggle || !mainNav) {
    return;
  }


  menuToggle.addEventListener(
    "click",
    function(event) {

      event.stopPropagation();

      const isActive =
        mainNav.classList.toggle(
          "active"
        );

      menuToggle.setAttribute(
        "aria-expanded",
        String(isActive)
      );

    }
  );


  mainNav.addEventListener(
    "click",
    function(event) {

      event.stopPropagation();

    }
  );


  document.addEventListener(
    "click",
    function() {

      if (
        mainNav.classList.contains(
          "active"
        )
      ) {

        mainNav.classList.remove(
          "active"
        );

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      }

    }
  );


  document
    .querySelectorAll(
      "#mainNav a"
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        function() {

          mainNav.classList.remove(
            "active"
          );

          menuToggle.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    });

}


/* =====================================================
   FOOTER YEAR
===================================================== */

function initializeYear() {

  const yearElement =
    document.getElementById(
      "year"
    );

  if (!yearElement) {
    return;
  }

  yearElement.textContent =
    new Date().getFullYear();

}


/* =====================================================
   POETRY
===================================================== */

async function loadPoetry() {

  const container =
    document.getElementById(
      "poetry-list"
    );

  if (!container) {
    return [];
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("poems")
      .select("*")
      .eq("published", true)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Poetry Error:",
      error
    );

    container.innerHTML = `

      <div>

        <p class="card-label">
          POETRY
        </p>

        <h3>
          কবিতা লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

    return [];

  }


  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML = `

      <div>

        <p class="card-label">
          POETRY
        </p>

        <h3>
          শীঘ্রই আসছে
        </h3>

        <p>
          নতুন কবিতা খুব শীঘ্রই প্রকাশিত হবে।
        </p>

      </div>

    `;

    return [];

  }


  container.innerHTML =
    data.map(
      (poem, index) => {

        const date =
          poem.created_at;

        return `

          <article
            class="writing-item"
            data-year="${getPublishedYear(date) || ""}"
          >

            <div class="card-number">
              ${String(index + 1).padStart(2, "0")}
            </div>


            <div>

              <p class="card-label">
                POETRY
              </p>


              <div class="published-date">
                PUBLISHED — ${formatPublishedDate(date)}
              </div>


              <h3>
                ${escapeHtml(poem.title)}
              </h3>


              ${
                poem.excerpt
                  ? `
                    <p>
                      ${escapeHtml(
                        poem.excerpt
                      )}
                    </p>
                  `
                  : ""
              }


              <a
                href="poem.html?id=${encodeURIComponent(poem.id)}"
                class="text-link"
              >
                কবিতা পড়ুন →
              </a>


              ${createWritingActions(
                "poem",
                poem.id,
                poem.title
              )}

            </div>

          </article>

        `;

      }
    ).join("");


  return data;

}


/* =====================================================
   STORIES
===================================================== */

async function loadStories() {

  const container =
    document.getElementById(
      "stories-container"
    );

  if (!container) {
    return [];
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("stories")
      .select("*")
      .eq("published", true)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Stories Error:",
      error
    );

    container.innerHTML = `

      <div class="story-card">

        <span>
          STORIES
        </span>

        <h3>
          গল্প লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

    return [];

  }


  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML = `

      <div class="story-card">

        <span>
          STORIES
        </span>

        <h3>
          কোনো প্রকাশিত গল্প নেই
        </h3>

        <p>
          Admin Dashboard থেকে গল্পটি
          Publish করা আছে কিনা দেখুন।
        </p>

      </div>

    `;

    return [];

  }


  container.innerHTML =
    data.map(
      (story, index) => {

        const date =
          story.created_at;

        return `

          <article
            class="story-card"
            data-year="${getPublishedYear(date) || ""}"
          >

            <span>
              STORY ${String(index + 1).padStart(2, "0")}
            </span>


            <div class="published-date">
              PUBLISHED — ${formatPublishedDate(date)}
            </div>


            <h3>
              ${escapeHtml(story.title)}
            </h3>


            ${
              story.excerpt
                ? `
                  <p>
                    ${escapeHtml(
                      story.excerpt
                    )}
                  </p>
                `
                : ""
            }


            <a
              href="story.html?id=${encodeURIComponent(story.id)}"
            >
              গল্প পড়ুন ↗
            </a>


            ${createWritingActions(
              "story",
              story.id,
              story.title
            )}

          </article>

        `;

      }
    ).join("");


  return data;

}


/* =====================================================
   NOVELS
===================================================== */

async function loadNovels() {

  const container =
    document.getElementById(
      "novels-container"
    );

  if (!container) {
    return [];
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("novels")
      .select("*")
      .eq("published", true)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Novels Error:",
      error
    );

    container.innerHTML = `

      <div class="novel-card">

        <p class="card-label">
          NOVELS
        </p>

        <h3>
          উপন্যাস লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

    return [];

  }


  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML = `

      <div class="novel-card">

        <p class="card-label">
          NOVELS
        </p>

        <h3>
          শীঘ্রই আসছে
        </h3>

        <p>
          নতুন উপন্যাস খুব শীঘ্রই প্রকাশিত হবে।
        </p>

      </div>

    `;

    return [];

  }


  container.innerHTML =
    data.map(
      (novel, index) => {

        const date =
          novel.created_at;

        return `

          <article
            class="novel-card"
            data-year="${getPublishedYear(date) || ""}"
          >

            <div class="novel-info">

              <p class="card-label">
                NOVEL ${String(index + 1).padStart(2, "0")}
              </p>


              <div class="published-date">
                PUBLISHED — ${formatPublishedDate(date)}
              </div>


              <h3>
                ${escapeHtml(novel.title)}
              </h3>


              ${
                novel.excerpt
                  ? `
                    <p>
                      ${escapeHtml(
                        novel.excerpt
                      )}
                    </p>
                  `
                  : ""
              }


              <a
                href="novel.html?id=${encodeURIComponent(novel.id)}"
                class="text-link"
              >
                উপন্যাস পড়ুন →
              </a>


              ${createWritingActions(
                "novel",
                novel.id,
                novel.title
              )}

            </div>

          </article>

        `;

      }
    ).join("");


  return data;

}


/* =====================================================
   MOST VIEWED
===================================================== */

function getViewCount(item) {

  const possibleFields = [
    "view_count",
    "views",
    "viewCount"
  ];


  for (
    const field of possibleFields
  ) {

    if (
      item &&
      item[field] !== undefined &&
      item[field] !== null
    ) {

      const number =
        Number(item[field]);

      if (
        Number.isFinite(number)
      ) {

        return number;

      }

    }

  }


  return 0;

}


/* =====================================================
   MOST VIEWED CARD
===================================================== */

function createMostViewedCard(
  type,
  item,
  index
) {

  const date =
    item.created_at;

  const views =
    getViewCount(item);


  return `

    <article
      class="most-viewed-card"
      data-year="${getPublishedYear(date) || ""}"
    >

      <div>

        <div class="most-viewed-card-number">
          ${String(index + 1).padStart(2, "0")}
        </div>


        <div class="published-date">
          PUBLISHED — ${formatPublishedDate(date)}
        </div>


        <h3>
          ${escapeHtml(item.title)}
        </h3>


        ${
          item.excerpt
            ? `
              <p>
                ${escapeHtml(
                  item.excerpt
                )}
              </p>
            `
            : ""
        }

      </div>


      <div class="most-viewed-card-footer">

        <span class="view-count">
          ${views.toLocaleString()} VIEWS
        </span>


        <a
          href="${getWritingUrl(
            type,
            item.id
          )}"
          class="text-link"
        >
          পড়ুন →
        </a>

      </div>


      ${createWritingActions(
        type,
        item.id,
        item.title
      )}

    </article>

  `;

}


/* =====================================================
   LOAD MOST VIEWED
===================================================== */

function loadMostViewed(
  data,
  type,
  containerId
) {

  const container =
    document.getElementById(
      containerId
    );

  if (!container) {
    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML = `
      <p>
        এখনও কোনো লেখা নেই।
      </p>
    `;

    return;

  }


  const sorted =
    [...data]
      .sort(
        (a, b) =>
          getViewCount(b) -
          getViewCount(a)
      )
      .slice(0, 6);


  container.innerHTML =
    sorted
      .map(
        (item, index) =>
          createMostViewedCard(
            type,
            item,
            index
          )
      )
      .join("");

}


/* =====================================================
   YEARLY PUBLISHED
===================================================== */

function loadYearlyPublished(
  poems,
  stories,
  novels
) {

  const container =
    document.getElementById(
      "yearly-list"
    );

  if (!container) {
    return;
  }


  const years =
    new Set();


  [
    ...(poems || []),
    ...(stories || []),
    ...(novels || [])
  ]
    .forEach(item => {

      const year =
        getPublishedYear(
          item.created_at
        );

      if (year) {
        years.add(year);
      }

    });


  const sortedYears =
    [...years]
      .sort(
        (a, b) =>
          b - a
      );


  if (
    sortedYears.length === 0
  ) {

    container.innerHTML = `
      <span>
        No published years yet
      </span>
    `;

    return;

  }


  container.innerHTML =
    sortedYears
      .map(
        year => `

          <a
            href="#year-${year}"
            data-year-filter="${year}"
          >
            ${year}
          </a>

        `
      )
      .join("");


  document
    .querySelectorAll(
      "[data-year-filter]"
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          event.preventDefault();

          const year =
            Number(
              link.dataset.yearFilter
            );

          filterByYear(year);

        }
      );

    });

}


/* =====================================================
   YEAR FILTER
===================================================== */

function filterByYear(year) {

  const sections = [
    "poetry-list",
    "stories-container",
    "novels-container"
  ];


  sections.forEach(
    sectionId => {

      const container =
        document.getElementById(
          sectionId
        );

      if (!container) {
        return;
      }


      const cards =
        container.querySelectorAll(
          "[data-year]"
        );


      let found = false;


      cards.forEach(card => {

        const cardYear =
          Number(
            card.dataset.year
          );


        if (
          cardYear === year
        ) {

          card.style.display =
            "";

          found = true;

        } else {

          card.style.display =
            "none";

        }

      });


      if (found) {

        container.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    }
  );

}


/* =====================================================
   RESET YEAR FILTER
===================================================== */

function resetYearFilter() {

  document
    .querySelectorAll(
      "[data-year]"
    )
    .forEach(
      card => {
        card.style.display = "";
      }
    );

}


/* =====================================================
   REVEAL ANIMATION
===================================================== */

function initializeReveal() {

  const revealElements =
    document.querySelectorAll(
      `
        .intro-inner,
        .writing-card,
        .writing-item,
        .story-card,
        .novel-card,
        .most-viewed-card,
        .quote-container,
        .author-grid,
        .archive-heading
      `
    );


  if (
    !("IntersectionObserver" in window)
  ) {

    revealElements.forEach(
      element => {
        element.classList.add(
          "show"
        );
      }
    );

    return;

  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "show"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: 0.12
      }
    );


  revealElements.forEach(
    element => {

      element.classList.add(
        "reveal"
      );

      observer.observe(
        element
      );

    }
  );

}


/* =====================================================
   SMOOTH ANCHOR
===================================================== */

function initializeAnchors() {

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const targetId =
            link.getAttribute(
              "href"
            );

          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              targetId
            );

          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    });

}


/* =====================================================
   MAIN INITIALIZATION
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    initializeMenu();

    initializeYear();


    /*
      Load all writings in parallel.
    */

    const [
      poems,
      stories,
      novels
    ] =
      await Promise.all([
        loadPoetry(),
        loadStories(),
        loadNovels()
      ]);


    /*
      Year archive
    */

    loadYearlyPublished(
      poems,
      stories,
      novels
    );


    /*
      Most viewed
    */

    loadMostViewed(
      poems,
      "poem",
      "most-viewed-poems-list"
    );


    loadMostViewed(
      stories,
      "story",
      "most-viewed-stories-list"
    );


    loadMostViewed(
      novels,
      "novel",
      "most-viewed-novels-list"
    );


    /*
      Animations
    */

    initializeReveal();


    /*
      Smooth navigation
    */

    initializeAnchors();

  }
);


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.copyWritingLink =
  copyWritingLink;

window.shareWriting =
  shareWriting;

window.openComment =
  openComment;

window.filterByYear =
  filterByYear;

window.resetYearFilter =
  resetYearFilter;
