/* =====================================================
   SHADAT FATIH LITERARY ARCHIVE
   FINAL SCRIPT.JS
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

    const isOpen =
      mainNav.classList.toggle("active");

    menuToggle.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

    mainNav.setAttribute(
      "aria-hidden",
      isOpen ? "false" : "true"
    );

  });


  /* SUB MENU */

  mainNav
    .querySelectorAll("[data-toggle]")
    .forEach(button => {

      button.addEventListener("click", event => {

        event.stopPropagation();

        const targetId =
          button.getAttribute("data-toggle");

        const target =
          document.getElementById(targetId);

        if (!target) return;

        const isOpen =
          target.classList.toggle("active");

        button.setAttribute(
          "aria-expanded",
          isOpen ? "true" : "false"
        );

        const arrow =
          button.querySelector(".menu-arrow");

        if (arrow) {
          arrow.textContent =
            isOpen ? "−" : "+";
        }

      });

    });


  /* CLOSE AFTER MAIN LINK */

  mainNav
    .querySelectorAll(".menu-main-links a")
    .forEach(link => {

      link.addEventListener("click", () => {

        mainNav.classList.remove("active");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        mainNav.setAttribute(
          "aria-hidden",
          "true"
        );

      });

    });


  /* CLOSE OUTSIDE */

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

      mainNav.setAttribute(
        "aria-hidden",
        "true"
      );

    }

  });


  /* ESCAPE */

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      mainNav.classList.remove("active");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      mainNav.setAttribute(
        "aria-hidden",
        "true"
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
   MONTH
===================================================== */

function getMonth(dateValue) {

  if (!dateValue) return "";

  const date =
    new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.getMonth();

}


/* =====================================================
   YEAR
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
   BANGLA MONTHS
===================================================== */

const BANGLA_MONTHS = [

  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর"

];


/* =====================================================
   TYPE LABEL
===================================================== */

function typeLabel(type) {

  if (type === "poem") {
    return "কবিতা";
  }

  if (type === "story") {
    return "গল্প";
  }

  if (type === "novel") {
    return "উপন্যাস";
  }

  return "";

}


/* =====================================================
   TYPE URL
===================================================== */

function typeUrl(type, id) {

  return `${type}.html?id=${encodeURIComponent(id)}`;

}


/* =====================================================
   CURRENT CONTENT URL
===================================================== */

function getContentUrl(type, id) {

  const base =
    window.location.href
      .split("#")[0]
      .split("?")[0];

  const directory =
    base.substring(
      0,
      base.lastIndexOf("/") + 1
    );

  return (
    directory +
    `${type}.html?id=${encodeURIComponent(id)}`
  );

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

async function shareContent(title, url) {

  if (navigator.share) {

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
   COMMENT
===================================================== */

function openComment(type, id) {

  const url =
    `${type}.html?id=${encodeURIComponent(id)}#comments`;

  window.location.href =
    url;

}


/* =====================================================
   VIEWS DISPLAY
===================================================== */

function totalViews(item) {

  const views =
    Number(item?.views || 0);

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

function actionButtons(type, id, title) {

  const url =
    getContentUrl(
      type,
      id
    );

  return `

    <div class="writing-actions">

      <button
        type="button"
        class="action-btn"
        onclick="openComment(
          '${escapeHtml(type)}',
          '${escapeHtml(id)}'
        )"
        title="Comment"
      >

        <span>◌</span>

        <small>
          Comment
        </small>

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

        <small>
          Share
        </small>

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

        <small>
          Copy
        </small>

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


    /*
      যদি views column না থাকে,
      আবার views ছাড়া query করা হবে।
    */

    if (
      error &&
      String(error.message)
        .toLowerCase()
        .includes("views")
    ) {

      const fallback =
        await window.supabaseClient
          .from("poems")
          .select(
            "id, title, content, excerpt, created_at, published"
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

      if (fallback.error)
        throw fallback.error;

      return renderPoetry(
        container,
        fallback.data || []
      );

    }


    if (error) throw error;

    renderPoetry(
      container,
      data || []
    );


  } catch (error) {

    console.error(
      "Poetry Error:",
      error
    );

    container.innerHTML = `

      <div class="error-card">

        <span>
          POETRY
        </span>

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
   RENDER POETRY
===================================================== */

function renderPoetry(container, data) {

  if (!data.length) {

    container.innerHTML = `

      <div class="empty-card">

        <span>
          POETRY
        </span>

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


            ${poem.views !== undefined
              ? totalViews(poem)
              : ""
            }


            <a
              href="${typeUrl(
                "poem",
                poem.id
              )}"
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


    if (
      error &&
      String(error.message)
        .toLowerCase()
        .includes("views")
    ) {

      const fallback =
        await window.supabaseClient
          .from("stories")
          .select(
            "id, title, excerpt, content, created_at, published"
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

      if (fallback.error)
        throw fallback.error;

      return renderStories(
        container,
        fallback.data || []
      );

    }


    if (error) throw error;

    renderStories(
      container,
      data || []
    );


  } catch (error) {

    console.error(
      "Stories Error:",
      error
    );

    container.innerHTML = `

      <div class="story-card error-card">

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

  }

}


/* =====================================================
   RENDER STORIES
===================================================== */

function renderStories(container, data) {

  if (!data.length) {

    container.innerHTML = `

      <div class="story-card empty-card">

        <span>
          STORIES
        </span>

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


          ${story.views !== undefined
            ? totalViews(story)
            : ""
          }


          <a
            href="${typeUrl(
              "story",
              story.id
            )}"
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


    if (
      error &&
      String(error.message)
        .toLowerCase()
        .includes("views")
    ) {

      const fallback =
        await window.supabaseClient
          .from("novels")
          .select(
            "id, title, content, excerpt, created_at, published"
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

      if (fallback.error)
        throw fallback.error;

      return renderNovels(
        container,
        fallback.data || []
      );

    }


    if (error) throw error;

    renderNovels(
      container,
      data || []
    );


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
   RENDER NOVELS
===================================================== */

function renderNovels(container, data) {

  if (!data.length) {

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


            ${novel.views !== undefined
              ? totalViews(novel)
              : ""
            }


            <a
              href="${typeUrl(
                "novel",
                novel.id
              )}"
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

}


/* =====================================================
   YEARLY ARCHIVE
===================================================== */

async function loadYearlyArchive() {

  const container =
    document.getElementById(
      "archiveYears"
    );

  if (!container) return;


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
            "id,title,created_at,published"
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
          ),

        window.supabaseClient
          .from("stories")
          .select(
            "id,title,created_at,published"
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
          ),

        window.supabaseClient
          .from("novels")
          .select(
            "id,title,created_at,published"
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
          )

      ]);


    if (poemsResult.error)
      throw poemsResult.error;

    if (storiesResult.error)
      throw storiesResult.error;

    if (novelsResult.error)
      throw novelsResult.error;


    const all = [

      ...(poemsResult.data || [])
        .map(item => ({
          ...item,
          type: "poem"
        })),

      ...(storiesResult.data || [])
        .map(item => ({
          ...item,
          type: "story"
        })),

      ...(novelsResult.data || [])
        .map(item => ({
          ...item,
          type: "novel"
        }))

    ];


    if (!all.length) {

      container.innerHTML = `
        <p>
          এখনো কোনো প্রকাশিত লেখা নেই।
        </p>
      `;

      return;

    }


    const years = {};


    all.forEach(item => {

      const year =
        getYear(item.created_at);

      const month =
        getMonth(item.created_at);


      if (!years[year]) {
        years[year] = {};
      }


      if (!years[year][month]) {
        years[year][month] = [];
      }


      years[year][month].push(item);

    });


    const sortedYears =
      Object.keys(years)
        .sort(
          (a, b) =>
            Number(b) - Number(a)
        );


    container.innerHTML =
      sortedYears
        .map(year => {

          const months =
            years[year];

          const sortedMonths =
            Object.keys(months)
              .sort(
                (a, b) =>
                  Number(b) - Number(a)
              );


          return `

            <div class="archive-year">

              <button
                type="button"
                class="archive-year-title"
                data-archive-toggle="year-${year}"
              >

                <span>
                  ${escapeHtml(year)}
                </span>

                <span>
                  +
                </span>

              </button>


              <div
                class="archive-year-content"
                id="year-${year}"
              >

                ${sortedMonths
                  .map(month => {

                    const items =
                      months[month];

                    return `

                      <div class="archive-month">

                        <button
                          type="button"
                          class="archive-month-title"
                          data-archive-toggle="month-${year}-${month}"
                        >

                          <span>
                            ${
                              BANGLA_MONTHS[
                                Number(month)
                              ]
                            }
                          </span>

                          <span>
                            +
                          </span>

                        </button>


                        <div
                          class="archive-month-content"
                          id="month-${year}-${month}"
                        >

                          ${renderArchiveTypes(items)}

                        </div>

                      </div>

                    `;

                  })
                  .join("")}

              </div>

            </div>

          `;

        })
        .join("");


    initArchiveToggles();


  } catch (error) {

    console.error(
      "Yearly Archive Error:",
      error
    );

    container.innerHTML = `
      <p>
        Archive লোড করা যায়নি।
      </p>
    `;

  }

}


/* =====================================================
   ARCHIVE TYPES
===================================================== */

function renderArchiveTypes(items) {

  const types = {

    poem: [],
    story: [],
    novel: []

  };


  items.forEach(item => {

    if (types[item.type]) {
      types[item.type].push(item);
    }

  });


  return Object.keys(types)
    .filter(
      type =>
        types[type].length > 0
    )
    .map(type => {

      return `

        <div class="archive-type">

          <div class="archive-type-title">
            ${typeLabel(type)}
          </div>


          <div class="archive-type-items">

            ${types[type]
              .map(item => `

                <a
                  href="${typeUrl(
                    type,
                    item.id
                  )}"
                  class="menu-sub-link archive-item-link"
                >

                  <span>
                    ${escapeHtml(item.title)}
                  </span>

                </a>

              `)
              .join("")}

          </div>

        </div>

      `;

    })
    .join("");

}


/* =====================================================
   ARCHIVE TOGGLES
===================================================== */

function initArchiveToggles() {

  document
    .querySelectorAll(
      "[data-archive-toggle]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          const id =
            button.getAttribute(
              "data-archive-toggle"
            );

          const target =
            document.getElementById(id);

          if (!target) return;


          const isOpen =
            target.classList.toggle(
              "active"
            );


          const spans =
            button.querySelectorAll(
              "span"
            );


          if (spans.length > 1) {

            spans[1].textContent =
              isOpen ? "−" : "+";

          }

        }
      );

    });

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

        getMostViewed("poems"),

        getMostViewed("stories"),

        getMostViewed("novels")

      ]);


    renderMostMenu(
      poemList,
      poemsResult,
      "poem"
    );


    renderMostMenu(
      storyList,
      storiesResult,
      "story"
    );


    renderMostMenu(
      novelList,
      novelsResult,
      "novel"
    );


  } catch (error) {

    console.error(
      "Most Viewed Error:",
      error
    );

    /*
      Error হলেও menu পুরোপুরি
      ভেঙে যাবে না।
    */

    if (poemList) {
      poemList.innerHTML =
        "<p>ডেটা পাওয়া যায়নি।</p>";
    }

    if (storyList) {
      storyList.innerHTML =
        "<p>ডেটা পাওয়া যায়নি।</p>";
    }

    if (novelList) {
      novelList.innerHTML =
        "<p>ডেটা পাওয়া যায়নি।</p>";
    }

  }

}


/* =====================================================
   GET MOST VIEWED
===================================================== */

async function getMostViewed(table) {

  /*
    প্রথমে views অনুযায়ী query
  */

  const result =
    await window.supabaseClient

      .from(table)

      .select(
        "id,title,created_at,views"
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

      .limit(5);


  /*
    views column না থাকলে fallback
  */

  if (
    result.error &&
    String(result.error.message)
      .toLowerCase()
      .includes("views")
  ) {

    const fallback =
      await window.supabaseClient

        .from(table)

        .select(
          "id,title,created_at"
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
        )

        .limit(5);


    if (fallback.error)
      throw fallback.error;


    return fallback.data || [];

  }


  if (result.error)
    throw result.error;


  return result.data || [];

}


/* =====================================================
   RENDER MOST VIEWED
===================================================== */

function renderMostMenu(
  container,
  data,
  type
) {

  if (!container) return;


  if (!data.length) {

    container.innerHTML = `
      <p>
        এখনো কোনো লেখা নেই।
      </p>
    `;

    return;

  }


  container.innerHTML =
    data.map((item, index) => `

      <a
        href="${typeUrl(
          type,
          item.id
        )}"
        class="menu-sub-link most-item-link"
      >

        <span class="most-rank">
          ${String(index + 1).padStart(2, "0")}
        </span>

        <span>
          ${escapeHtml(item.title)}
        </span>

        ${
          item.views !== undefined
            ? `
              <span class="most-views">
                ${Number(
                  item.views || 0
                ).toLocaleString("en-US")}
              </span>
            `
            : ""
        }

      </a>

    `).join("");

}


/* =====================================================
   INCREMENT CONTENT VIEW
===================================================== */

/*
   poem.html / story.html / novel.html
   page থেকে এই function call করবে।

   Example:

   incrementContentView("poem", id);
*/

async function incrementContentView(
  type,
  id
) {

  const tableMap = {

    poem: "poems",

    story: "stories",

    novel: "novels"

  };


  const table =
    tableMap[type];


  if (!table || !id) return;


  try {

    /*
      প্রথমে বর্তমান views নেওয়া
    */

    const {
      data,
      error
    } =
      await window.supabaseClient

        .from(table)

        .select("views")

        .eq(
          "id",
          id
        )

        .maybeSingle();


    if (error) {

      console.warn(
        "View read error:",
        error.message
      );

      return;

    }


    const currentViews =
      Number(
        data?.views || 0
      );


    /*
      +1
    */

    const {
      error: updateError
    } =
      await window.supabaseClient

        .from(table)

        .update({
          views: currentViews + 1
        })

        .eq(
          "id",
          id
        );


    if (updateError) {

      console.warn(
        "View update error:",
        updateError.message
      );

    }

  } catch (error) {

    console.warn(
      "Increment View Error:",
      error
    );

  }

}


/* =====================================================
   WEBSITE TOTAL VIEWS
===================================================== */

async function loadWebsiteViews() {

  const element =
    document.getElementById(
      "totalWebsiteViews"
    );


  if (!element) return;


  try {

    const {
      data,
      error
    } =
      await window.supabaseClient

        .from("site_views")

        .select("views")

        .eq(
          "id",
          1
        )

        .maybeSingle();


    if (error) {

      console.warn(
        "Website Views:",
        error.message
      );

      return;

    }


    if (data) {

      element.textContent =
        Number(
          data.views || 0
        ).toLocaleString("en-US");

    }

  } catch (error) {

    console.warn(
      "Website Views Error:",
      error
    );

  }

}


/* =====================================================
   INCREMENT WEBSITE VIEW
===================================================== */

async function incrementWebsiteView() {

  try {

    const {
      data,
      error
    } =
      await window.supabaseClient

        .from("site_views")

        .select("views")

        .eq(
          "id",
          1
        )

        .maybeSingle();


    if (error) {

      console.warn(
        "Website view read error:",
        error.message
      );

      return;

    }


    const currentViews =
      Number(
        data?.views || 0
      );


    const {
      error: updateError
    } =
      await window.supabaseClient

        .from("site_views")

        .update({
          views: currentViews + 1
        })

        .eq(
          "id",
          1
        );


    if (updateError) {

      console.warn(
        "Website view update error:",
        updateError.message
      );

    }

  } catch (error) {

    console.warn(
      "Website view error:",
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
      ".author-grid"
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
   GLOBAL FUNCTIONS
===================================================== */

window.copyLink =
  copyLink;

window.shareContent =
  shareContent;

window.openComment =
  openComment;

window.incrementContentView =
  incrementContentView;

window.incrementWebsiteView =
  incrementWebsiteView;
