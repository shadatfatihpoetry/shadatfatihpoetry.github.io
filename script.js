/* =====================================================
   SHADAT FATIH LITERARY ARCHIVE
   SCRIPT.JS
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

  loadYearlyPublished();
  loadMostViewed();

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

    const isOpen =
      mainNav.classList.toggle("active");

    menuToggle.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

  });


  mainNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mainNav.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    });

  });


  document.addEventListener("click", event => {

    if (
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {

      mainNav.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  });


  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      mainNav.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  });

}


/* =====================================================
   YEAR
===================================================== */

function initYear() {

  const year =
    document.getElementById("year");

  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

}


/* =====================================================
   SECURITY
===================================================== */

function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =====================================================
   DATE
===================================================== */

function formatDate(dateValue) {

  if (!dateValue) return "";


  const date =
    new Date(dateValue);


  if (Number.isNaN(date.getTime())) {

    return "";

  }


  return date.toLocaleDateString(
    "bn-BD",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


/* =====================================================
   YEAR NUMBER
===================================================== */

function getYear(dateValue) {

  if (!dateValue) return "";


  const date =
    new Date(dateValue);


  if (Number.isNaN(date.getTime())) {

    return "";

  }


  return date.getFullYear();

}


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

  let toast =
    document.getElementById("sf-toast");


  if (!toast) {

    toast =
      document.createElement("div");

    toast.id =
      "sf-toast";

    toast.className =
      "sf-toast";

    document.body.appendChild(toast);

  }


  toast.textContent =
    message;


  toast.classList.add("show");


  clearTimeout(
    window.sfToastTimer
  );


  window.sfToastTimer =
    setTimeout(() => {

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

    const textarea =
      document.createElement("textarea");

    textarea.value =
      url;

    document.body.appendChild(
      textarea
    );

    textarea.select();

    document.execCommand("copy");

    textarea.remove();

    showToast("লিংক কপি হয়েছে");

  }

}


/* =====================================================
   SHARE
===================================================== */

async function shareContent(
  title,
  url
) {

  if (
    navigator.share
  ) {

    try {

      await navigator.share({
        title,
        url
      });

    } catch (error) {

      /* User cancelled */

    }

    return;

  }


  await copyLink(url);

}


/* =====================================================
   COMMENT PAGE
===================================================== */

function openComment(
  type,
  id
) {

  const url =
    `${type}.html?id=${encodeURIComponent(id)}#comments`;


  window.location.href =
    url;

}


/* =====================================================
   VIEWS
===================================================== */

function totalViews(item) {

  const views =
    Number(item.views || 0);


  return `

    <div class="total-views">

      <span class="views-icon">
        ◉
      </span>

      <span>
        ${views.toLocaleString("en-US")}
      </span>

    </div>

  `;

}


/* =====================================================
   ACTION BUTTONS
===================================================== */

function actionButtons(
  type,
  id,
  title
) {

  const url =
    `${window.location.origin}${window.location.pathname.replace(
      /index\.html$/,
      ""
    )}${type}.html?id=${encodeURIComponent(id)}`;


  return `

    <div class="writing-actions">

      <button
        type="button"
        class="action-btn"
        onclick="openComment('${type}', '${id}')"
        title="Comment"
      >
        <span>◌</span>
        <small>Comment</small>
      </button>


      <button
        type="button"
        class="action-btn"
        onclick="shareContent(
          ${JSON.stringify(title)},
          ${JSON.stringify(url)}
        )"
        title="Share"
      >
        <span>↗</span>
        <small>Share</small>
      </button>


      <button
        type="button"
        class="action-btn"
        onclick="copyLink(
          ${JSON.stringify(url)}
        )"
        title="Copy Link"
      >
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

  const container =
    document.getElementById(
      "poetry-list"
    );


  if (!container) return;


  try {

    const {
      data,
      error
    } =
      await window.supabaseClient

        .from("poems")

        .select(
          "id, title, content, excerpt, created_at, published, views"
        )

        .eq(
          "published",
          true
        )

        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) throw error;


    if (!data || data.length === 0) {

      container.innerHTML = `

        <div class="empty-card">

          <span>POETRY</span>

          <h3>
            শীঘ্রই আসছে
          </h3>

          <p>
            নতুন কবিতা খুব শীঘ্রই প্রকাশিত হবে।
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      data.map((poem, index) => {

        return `

          <article class="writing-card">

            ${totalViews(poem)}


            <div class="card-number">
              ${String(index + 1).padStart(2, "0")}
            </div>


            <div class="writing-card-content">

              <div class="published-date">
                ${formatDate(poem.created_at)}
              </div>


              <p class="card-label">
                POETRY
              </p>


              <h3>
                ${escapeHtml(poem.title)}
              </h3>


              ${
                poem.excerpt
                  ? `
                    <p class="writing-excerpt">
                      ${escapeHtml(poem.excerpt)}
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


              ${actionButtons(
                "poem",
                poem.id,
                poem.title
              )}

            </div>

          </article>

        `;

      }).join("");

  } catch (error) {

    console.error(
      "Poetry Error:",
      error
    );


    container.innerHTML = `

      <div class="error-card">

        <span>POETRY</span>

        <h3>
          কবিতা লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

  }

}


/* =====================================================
   STORIES
===================================================== */

async function loadStories() {

  const container =
    document.getElementById(
      "stories-container"
    );


  if (!container) return;


  try {

    const {
      data,
      error
    } =
      await window.supabaseClient

        .from("stories")

        .select(
          "id, title, excerpt, content, created_at, published, views"
        )

        .eq(
          "published",
          true
        )

        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) throw error;


    if (!data || data.length === 0) {

      container.innerHTML = `

        <div class="story-card empty-card">

          <span>STORIES</span>

          <h3>
            কোনো প্রকাশিত গল্প নেই
          </h3>

          <p>
            নতুন গল্প খুব শীঘ্রই প্রকাশিত হবে।
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      data.map((story, index) => {

        return `

          <article class="story-card">

            ${totalViews(story)}


            <div class="published-date">
              ${formatDate(story.created_at)}
            </div>


            <span>
              STORY ${String(index + 1).padStart(2, "0")}
            </span>


            <h3>
              ${escapeHtml(story.title)}
            </h3>


            ${
              story.excerpt
                ? `
                  <p>
                    ${escapeHtml(story.excerpt)}
                  </p>
                `
                : ""
            }


            <a
              href="story.html?id=${encodeURIComponent(story.id)}"
              class="text-link"
            >
              গল্প পড়ুন ↗
            </a>


            ${actionButtons(
              "story",
              story.id,
              story.title
            )}

          </article>

        `;

      }).join("");

  } catch (error) {

    console.error(
      "Stories Error:",
      error
    );


    container.innerHTML = `

      <div class="story-card error-card">

        <span>STORIES</span>

        <h3>
          গল্প লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

  }

}


/* =====================================================
   NOVELS
===================================================== */

async function loadNovels() {

  const container =
    document.getElementById(
      "novels-container"
    );


  if (!container) return;


  try {

    const {
      data,
      error
    } =
      await window.supabaseClient

        .from("novels")

        .select(
          "id, title, content, excerpt, created_at, published, views"
        )

        .eq(
          "published",
          true
        )

        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (error) throw error;


    if (!data || data.length === 0) {

      container.innerHTML = `

        <div class="novel-card empty-card">

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

      return;

    }


    container.innerHTML =
      data.map((novel, index) => {

        return `

          <article class="novel-card">

            ${totalViews(novel)}


            <div class="novel-info">

              <div class="published-date">
                ${formatDate(novel.created_at)}
              </div>


              <p class="card-label">
                NOVEL ${String(index + 1).padStart(2, "0")}
              </p>


              <h3>
                ${escapeHtml(novel.title)}
              </h3>


              ${
                novel.excerpt
                  ? `
                    <p>
                      ${escapeHtml(novel.excerpt)}
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


              ${actionButtons(
                "novel",
                novel.id,
                novel.title
              )}

            </div>

          </article>

        `;

      }).join("");

  } catch (error) {

    console.error(
      "Novels Error:",
      error
    );


    container.innerHTML = `

      <div class="novel-card error-card">

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

  }

}


/* =====================================================
   YEARLY ARCHIVE
===================================================== */

async function loadYearlyPublished() {

  const poemList =
    document.getElementById(
      "yearPoemsList"
    );

  const storyList =
    document.getElementById(
      "yearStoriesList"
    );

  const novelList =
    document.getElementById(
      "yearNovelsList"
    );


  if (
    !poemList &&
    !storyList &&
    !novelList
  ) {

    return;

  }


  try {

    const [
      poemsResult,
      storiesResult,
      novelsResult
    ] =
      await Promise.all([

        window.supabaseClient
          .from("poems")
          .select(
            "id,title,created_at"
          )
          .eq(
            "published",
            true
          ),

        window.supabaseClient
          .from("stories")
          .select(
            "id,title,created_at"
          )
          .eq(
            "published",
            true
          ),

        window.supabaseClient
          .from("novels")
          .select(
            "id,title,created_at"
          )
          .eq(
            "published",
            true
          )

      ]);


    if (poemsResult.error)
      throw poemsResult.error;

    if (storiesResult.error)
      throw storiesResult.error;

    if (novelsResult.error)
      throw novelsResult.error;


    const currentYear =
      new Date().getFullYear();


    function renderYearList(
      container,
      data,
      type
    ) {

      if (!container) return;


      const items =
        (data || [])
          .filter(
            item =>
              getYear(item.created_at) ===
              currentYear
          );


      if (!items.length) {

        container.innerHTML =
          "<p>এখনো কোনো লেখা নেই।</p>";

        return;

      }


      container.innerHTML =
        items.map(item => `

          <a
            class="year-item"
            href="${type}.html?id=${encodeURIComponent(item.id)}"
          >

            <span>
              ${type.toUpperCase()}
            </span>

            <strong>
              ${escapeHtml(item.title)}
            </strong>

            <small>
              ${formatDate(item.created_at)}
            </small>

          </a>

        `).join("");

    }


    renderYearList(
      poemList,
      poemsResult.data,
      "poem"
    );


    renderYearList(
      storyList,
      storiesResult.data,
      "story"
    );


    renderYearList(
      novelList,
      novelsResult.data,
      "novel"
    );

  } catch (error) {

    console.error(
      "Year Archive Error:",
      error
    );

  }

}


/* =====================================================
   MOST VIEWED
===================================================== */

async function loadMostViewed() {

  const poemList =
    document.getElementById(
      "mostPoemsList"
    );

  const storyList =
    document.getElementById(
      "mostStoriesList"
    );

  const novelList =
    document.getElementById(
      "mostNovelsList"
    );


  if (
    !poemList &&
    !storyList &&
    !novelList
  ) {

    return;

  }


  try {

    const [
      poemsResult,
      storiesResult,
      novelsResult
    ] =
      await Promise.all([

        window.supabaseClient
          .from("poems")
          .select(
            "id,title,excerpt,created_at,views"
          )
          .eq(
            "published",
            true
          )
          .order(
            "views",
            {
              ascending: false
            }
          )
          .limit(10),

        window.supabaseClient
          .from("stories")
          .select(
            "id,title,excerpt,created_at,views"
          )
          .eq(
            "published",
            true
          )
          .order(
            "views",
            {
              ascending: false
            }
          )
          .limit(10),

        window.supabaseClient
          .from("novels")
          .select(
            "id,title,excerpt,created_at,views"
          )
          .eq(
            "published",
            true
          )
          .order(
            "views",
            {
              ascending: false
            }
          )
          .limit(10)

      ]);


    function renderMostViewed(
      container,
      data,
      type
    ) {

      if (!container) return;


      if (!data || !data.length) {

        container.innerHTML =
          "<p>এখনো কোনো লেখা নেই।</p>";

        return;

      }


      container.innerHTML =
        data.map((item, index) => `

          <article class="most-viewed-card">

            <div class="most-viewed-rank">
              ${String(index + 1).padStart(2, "0")}
            </div>


            <div class="most-viewed-content">

              <span>
                ${type.toUpperCase()}
              </span>


              <h3>
                ${escapeHtml(item.title)}
              </h3>


              <div class="total-views">
                ◉ ${Number(item.views || 0).toLocaleString("en-US")}
              </div>


              <a
                href="${type}.html?id=${encodeURIComponent(item.id)}"
                class="text-link"
              >
                পড়ুন →
              </a>

            </div>

          </article>

        `).join("");

    }


    renderMostViewed(
      poemList,
      poemsResult.data,
      "poem"
    );


    renderMostViewed(
      storyList,
      storiesResult.data,
      "story"
    );


    renderMostViewed(
      novelList,
      novelsResult.data,
      "novel"
    );

  } catch (error) {

    console.error(
      "Most Viewed Error:",
      error
    );

  }

}


/* =====================================================
   SCROLL REVEAL
===================================================== */

function initReveal() {

  const elements =
    document.querySelectorAll(
      ".intro-inner, " +
      ".writing-card, " +
      ".story-card, " +
      ".novel-card, " +
      ".quote-container, " +
      ".author-grid, " +
      ".year-card, " +
      ".most-viewed-card"
    );


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      element =>
        element.classList.add("show")
    );

    return;

  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

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

        });

      },
      {
        threshold: 0.08
      }
    );


  elements.forEach(element => {

    element.classList.add(
      "reveal"
    );

    observer.observe(
      element
    );

  });

}


/* =====================================================
   GLOBAL
===================================================== */

window.copyLink =
  copyLink;

window.shareContent =
  shareContent;

window.openComment =
  openComment;
