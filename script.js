/* =====================================================
   SHADAT FATIH LITERARY ARCHIVE
   FINAL SCRIPT.JS
===================================================== */


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
   THREE DOT MENU
===================================================== */

function initMenu() {

  const menuToggle =
    document.getElementById("menuToggle");

  const mainNav =
    document.getElementById("mainNav");


  if (!menuToggle || !mainNav) {
    return;
  }


  menuToggle.addEventListener("click", (event) => {

    event.stopPropagation();

    const isOpen =
      mainNav.classList.toggle("active");

    menuToggle.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

  });


  /* Close menu after clicking a link */

  mainNav
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener("click", () => {

        mainNav.classList.remove("active");

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      });

    });


  /* Close when clicking outside */

  document.addEventListener("click", (event) => {

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


  /* Close with Escape */

  document.addEventListener("keydown", (event) => {

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
   HTML SECURITY
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
   DATE FORMAT
===================================================== */

function formatDate(dateValue) {

  if (!dateValue) {

    return "";

  }


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

  if (!dateValue) {

    return "";

  }


  const date =
    new Date(dateValue);


  if (Number.isNaN(date.getTime())) {

    return "";

  }


  return date.getFullYear();

}


/* =====================================================
   COPY LINK
===================================================== */

async function copyLink(url) {

  try {

    await navigator.clipboard.writeText(url);

    showToast("লিংক কপি হয়েছে");

  } catch (error) {

    console.error(
      "Copy Error:",
      error
    );


    /* Fallback */

    const textarea =
      document.createElement("textarea");

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

async function shareContent(
  title,
  url
) {

  if (
    navigator.share
  ) {

    try {

      await navigator.share({
        title: title,
        url: url
      });

    } catch (error) {

      /*
       User cancelled share.
       No action required.
      */

    }

    return;

  }


  await copyLink(url);

}


/* =====================================================
   COMMENT
===================================================== */

function openComment(
  type,
  id
) {

  const url =
    `${type}.html?id=${encodeURIComponent(id)}#comments`;


  window.location.href = url;

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
   ACTION BUTTONS
===================================================== */

function actionButtons(
  type,
  id,
  title
) {

  const url =
    new URL(
      `${type}.html?id=${encodeURIComponent(id)}`,
      window.location.href
    ).href;


  return `

    <div class="writing-actions">

      <button
        type="button"
        class="action-btn"
        onclick="openComment('${escapeHtml(type)}', '${escapeHtml(id)}')"
      >
        Comment
      </button>


      <button
        type="button"
        class="action-btn"
        onclick="copyLink('${escapeHtml(url)}')"
      >
        Copy Link
      </button>


      <button
        type="button"
        class="action-btn"
        onclick="shareContent('${escapeHtml(title)}', '${escapeHtml(url)}')"
      >
        Share
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


  if (!container) {

    return;

  }


  try {

    const {
      data,
      error
    } =
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


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.length === 0
    ) {

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
      data
        .map(
          (poem, index) => {

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
                        <p>
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

          }
        )
        .join("");

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
   STORIES
===================================================== */

async function loadStories() {

  const container =
    document.getElementById(
      "stories-container"
    );


  if (!container) {

    return;

  }


  try {

    const {
      data,
      error
    } =
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


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.length === 0
    ) {

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
      data
        .map(
          (story, index) => {

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

          }
        )
        .join("");

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
   NOVELS
===================================================== */

async function loadNovels() {

  const container =
    document.getElementById(
      "novels-container"
    );


  if (!container) {

    return;

  }


  try {

    const {
      data,
      error
    } =
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


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.length === 0
    ) {

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
      data
        .map(
          (novel, index) => {

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

          }
        )
        .join("");

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
   YEARLY PUBLISHED
===================================================== */

async function loadYearlyPublished() {

  const container =
    document.getElementById(
      "yearly-container"
    );


  if (!container) {

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
            "id, title, created_at, published"
          )

          .eq(
            "published",
            true
          ),


        window.supabaseClient

          .from("stories")

          .select(
            "id, title, created_at, published"
          )

          .eq(
            "published",
            true
          ),


        window.supabaseClient

          .from("novels")

          .select(
            "id, title, created_at, published"
          )

          .eq(
            "published",
            true
          )

      ]);


    if (
      poemsResult.error
    ) {

      throw poemsResult.error;

    }


    if (
      storiesResult.error
    ) {

      throw storiesResult.error;

    }


    if (
      novelsResult.error
    ) {

      throw novelsResult.error;

    }


    const all =
      [

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


    if (all.length === 0) {

      container.innerHTML = `

        <div class="empty-card">

          <h3>
            কোনো প্রকাশিত লেখা নেই
          </h3>

        </div>

      `;

      return;

    }


    /* Group by year */

    const years = {};

    all.forEach(item => {

      const year =
        getYear(item.created_at);

      if (!years[year]) {

        years[year] = [];

      }

      years[year].push(item);

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

          const items =
            years[year];


          return `

            <div class="year-card">

              <div class="year-number">
                ${escapeHtml(year)}
              </div>


              <div class="year-items">

                ${items
                  .map(item => `

                    <a
                      href="${item.type}.html?id=${encodeURIComponent(item.id)}"
                      class="year-item"
                    >

                      <span>
                        ${
                          item.type === "poem"
                            ? "POEM"
                            : item.type === "story"
                              ? "STORY"
                              : "NOVEL"
                        }
                      </span>

                      <strong>
                        ${escapeHtml(item.title)}
                      </strong>

                      <small>
                        ${formatDate(item.created_at)}
                      </small>

                    </a>

                  `)
                  .join("")}

              </div>

            </div>

          `;

        })
        .join("");

  } catch (error) {

    console.error(
      "Yearly Archive Error:",
      error
    );


    container.innerHTML = `

      <div class="error-card">

        <h3>
          প্রকাশনা আর্কাইভ লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

  }

}


/* =====================================================
   MOST VIEWED
===================================================== */

async function loadMostViewed() {

  const container =
    document.getElementById(
      "most-viewed-container"
    );


  if (!container) {

    return;

  }


  try {

    /*
      প্রথমে poems/stories/novels থেকে
      published content নেওয়া হচ্ছে।

      যদি database-এ views column থাকে,
      তাহলে views অনুযায়ী sort করার চেষ্টা করা হবে।
    */


    const [
      poemsResult,
      storiesResult,
      novelsResult
    ] =
      await Promise.all([

        window.supabaseClient

          .from("poems")

          .select(
            "id, title, excerpt, created_at, published, views"
          )

          .eq(
            "published",
            true
          )


          .limit(10),


        window.supabaseClient

          .from("stories")

          .select(
            "id, title, excerpt, created_at, published, views"
          )

          .eq(
            "published",
            true
          )

          .limit(10),


        window.supabaseClient

          .from("novels")

          .select(
            "id, title, excerpt, created_at, published, views"
          )

          .eq(
            "published",
            true
          )

          .limit(10)

      ]);


    /*
      views column না থাকলে
      Supabase error দিতে পারে।
      তখন fallback query করা হবে।
    */


    let poems =
      poemsResult.error
        ? []
        : (
          poemsResult.data || []
        );


    let stories =
      storiesResult.error
        ? []
        : (
          storiesResult.data || []
        );


    let novels =
      novelsResult.error
        ? []
        : (
          novelsResult.data || []
        );


    /*
      Fallback:
      যদি views column না থাকে
    */

    if (poemsResult.error) {

      const result =
        await window.supabaseClient
          .from("poems")
          .select(
            "id, title, excerpt, created_at, published"
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

      poems =
        result.data || [];

    }


    if (storiesResult.error) {

      const result =
        await window.supabaseClient
          .from("stories")
          .select(
            "id, title, excerpt, created_at, published"
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

      stories =
        result.data || [];

    }


    if (novelsResult.error) {

      const result =
        await window.supabaseClient
          .from("novels")
          .select(
            "id, title, excerpt, created_at, published"
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

      novels =
        result.data || [];

    }


    const all =
      [

        ...poems.map(item => ({
          ...item,
          type: "poem"
        })),

        ...stories.map(item => ({
          ...item,
          type: "story"
        })),

        ...novels.map(item => ({
          ...item,
          type: "novel"
        }))

      ];


    if (all.length === 0) {

      container.innerHTML = `

        <div class="empty-card">

          <h3>
            এখনো কোনো লেখা নেই
          </h3>

        </div>

      `;

      return;

    }


    /*
      views থাকলে views অনুযায়ী।
      না থাকলে newest first.
    */

    all.sort(
      (a, b) => {

        const viewsA =
          Number(a.views || 0);

        const viewsB =
          Number(b.views || 0);


        if (
          viewsA !== viewsB
        ) {

          return viewsB - viewsA;

        }


        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        );

      }
    );


    const top =
      all.slice(0, 9);


    container.innerHTML =
      top
        .map(
          (item, index) => {

            return `

              <article class="most-viewed-card">


                <div class="most-viewed-rank">

                  ${String(index + 1).padStart(2, "0")}

                </div>


                <div class="most-viewed-content">


                  <div class="published-date">

                    ${formatDate(item.created_at)}

                  </div>


                  <span>

                    ${
                      item.type === "poem"
                        ? "POEM"
                        : item.type === "story"
                          ? "STORY"
                          : "NOVEL"
                    }

                  </span>


                  <h3>

                    ${escapeHtml(item.title)}

                  </h3>


                  ${
                    item.excerpt
                      ? `
                        <p>
                          ${escapeHtml(item.excerpt)}
                        </p>
                      `
                      : ""
                  }


                  <a
                    href="${item.type}.html?id=${encodeURIComponent(item.id)}"
                    class="text-link"
                  >

                    পড়ুন →

                  </a>


                </div>

              </article>

            `;

          }
        )
        .join("");

  } catch (error) {

    console.error(
      "Most Viewed Error:",
      error
    );


    container.innerHTML = `

      <div class="error-card">

        <h3>
          জনপ্রিয় লেখা লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(error.message)}
        </p>

      </div>

    `;

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

    elements.forEach(element => {

      element.classList.add(
        "show"
      );

    });

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
