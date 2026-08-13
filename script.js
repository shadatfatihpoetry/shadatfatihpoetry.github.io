"use strict";


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
   SECURITY
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
   DATE
===================================================== */

function formatDate(dateValue) {

  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
    .toUpperCase();

}


/* =====================================================
   URL
===================================================== */

function getWritingUrl(type, id) {

  const pages = {
    poem: "poem.html",
    story: "story.html",
    novel: "novel.html"
  };

  return `${pages[type]}?id=${encodeURIComponent(id)}`;

}


/* =====================================================
   COPY LINK
===================================================== */

async function copyWritingLink(type, id, button) {

  const url =
    new URL(
      getWritingUrl(type, id),
      window.location.href
    ).href;


  try {

    await navigator.clipboard.writeText(url);

    const oldText =
      button.textContent;

    button.textContent =
      "Copied";

    setTimeout(() => {

      button.textContent =
        oldText;

    }, 1500);

  } catch (error) {

    console.error(
      "Copy error:",
      error
    );

    window.prompt(
      "Copy link:",
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
    new URL(
      getWritingUrl(type, id),
      window.location.href
    ).href;


  if (
    navigator.share
  ) {

    try {

      await navigator.share({
        title:
          title || "Shadat Fatih",

        text:
          `${title || "লেখা"} — Shadat Fatih`,

        url
      });

      return;

    } catch (error) {

      if (
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

  window.location.href =
    `${getWritingUrl(type, id)}#comments`;

}


/* =====================================================
   ACTION BUTTONS
===================================================== */

function actionButtons(
  type,
  id,
  title
) {

  return `

    <div class="writing-actions">

      <button
        class="writing-action"
        type="button"
        data-action="comment"
        data-type="${escapeHtml(type)}"
        data-id="${escapeHtml(id)}"
      >
        Comment
      </button>

      <button
        class="writing-action"
        type="button"
        data-action="copy"
        data-type="${escapeHtml(type)}"
        data-id="${escapeHtml(id)}"
      >
        Copy Link
      </button>

      <button
        class="writing-action"
        type="button"
        data-action="share"
        data-type="${escapeHtml(type)}"
        data-id="${escapeHtml(id)}"
        data-title="${escapeHtml(title)}"
      >
        Share
      </button>

    </div>

  `;

}


/* =====================================================
   POEMS
===================================================== */

async function loadPoetry() {

  const container =
    document.getElementById(
      "poetry-list"
    );

  if (!container) {
    return [];
  }


  try {

    const result =
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


    const data =
      result.data;

    const error =
      result.error;


    if (error) {

      throw error;

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
        (poem, index) => `

          <article
            class="writing-item"
            data-year="${
              new Date(
                poem.created_at
              ).getFullYear()
            }"
          >

            <div class="card-number">
              ${String(
                index + 1
              ).padStart(2, "0")}
            </div>


            <div>

              <p class="card-label">
                POETRY
              </p>


              <div class="published-date">
                PUBLISHED — ${
                  formatDate(
                    poem.created_at
                  )
                }
              </div>


              <h3>
                ${
                  escapeHtml(
                    poem.title
                  )
                }
              </h3>


              ${
                poem.excerpt
                  ? `
                    <p>
                      ${
                        escapeHtml(
                          poem.excerpt
                        )
                      }
                    </p>
                  `
                  : ""
              }


              <a
                href="poem.html?id=${encodeURIComponent(
                  poem.id
                )}"
                class="text-link"
              >
                কবিতা পড়ুন →
              </a>


              ${
                actionButtons(
                  "poem",
                  poem.id,
                  poem.title
                )
              }

            </div>

          </article>

        `
      ).join("");


    return data;


  } catch (error) {

    console.error(
      "Poetry loading error:",
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
          ${escapeHtml(
            error.message
          )}
        </p>

      </div>

    `;


    return [];

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
    return [];
  }


  try {

    const result =
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


    const data =
      result.data;

    const error =
      result.error;


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `

        <article class="story-card">

          <span>
            STORIES
          </span>

          <h3>
            কোনো প্রকাশিত গল্প নেই
          </h3>

          <p>
            নতুন গল্প খুব শীঘ্রই প্রকাশিত হবে।
          </p>

        </article>

      `;

      return [];

    }


    container.innerHTML =
      data.map(
        (story, index) => `

          <article
            class="story-card"
            data-year="${
              new Date(
                story.created_at
              ).getFullYear()
            }"
          >

            <span>
              STORY ${
                String(
                  index + 1
                ).padStart(2, "0")
              }
            </span>


            <div class="published-date">
              PUBLISHED — ${
                formatDate(
                  story.created_at
                )
              }
            </div>


            <h3>
              ${
                escapeHtml(
                  story.title
                )
              }
            </h3>


            ${
              story.excerpt
                ? `
                  <p>
                    ${
                      escapeHtml(
                        story.excerpt
                      )
                    }
                  </p>
                `
                : ""
            }


            <a
              href="story.html?id=${encodeURIComponent(
                story.id
              )}"
            >
              গল্প পড়ুন ↗
            </a>


            ${
              actionButtons(
                "story",
                story.id,
                story.title
              )
            }

          </article>

        `
      ).join("");


    return data;


  } catch (error) {

    console.error(
      "Stories loading error:",
      error
    );


    container.innerHTML = `

      <article class="story-card">

        <span>
          STORIES
        </span>

        <h3>
          গল্প লোড করা যায়নি
        </h3>

        <p>
          ${escapeHtml(
            error.message
          )}
        </p>

      </article>

    `;


    return [];

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
    return [];
  }


  try {

    const result =
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


    const data =
      result.data;

    const error =
      result.error;


    if (error) {

      throw error;

    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `

        <article class="novel-card">

          <div class="novel-info">

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

        </article>

      `;

      return [];

    }


    container.innerHTML =
      data.map(
        (novel, index) => `

          <article
            class="novel-card"
            data-year="${
              new Date(
                novel.created_at
              ).getFullYear()
            }"
          >

            <div class="novel-info">

              <p class="card-label">
                NOVEL ${
                  String(
                    index + 1
                  ).padStart(2, "0")
                }
              </p>


              <div class="published-date">
                PUBLISHED — ${
                  formatDate(
                    novel.created_at
                  )
                }
              </div>


              <h3>
                ${
                  escapeHtml(
                    novel.title
                  )
                }
              </h3>


              ${
                novel.excerpt
                  ? `
                    <p>
                      ${
                        escapeHtml(
                          novel.excerpt
                        )
                      }
                    </p>
                  `
                  : ""
              }


              <a
                href="novel.html?id=${encodeURIComponent(
                  novel.id
                )}"
                class="text-link"
              >
                উপন্যাস পড়ুন →
              </a>


              ${
                actionButtons(
                  "novel",
                  novel.id,
                  novel.title
                )
              }

            </div>

          </article>

        `
      ).join("");


    return data;


  } catch (error) {

    console.error(
      "Novels loading error:",
      error
    );


    container.innerHTML = `

      <article class="novel-card">

        <div class="novel-info">

          <p class="card-label">
            NOVELS
          </p>

          <h3>
            উপন্যাস লোড করা যায়নি
          </h3>

          <p>
            ${escapeHtml(
              error.message
            )}
          </p>

        </div>

      </article>

    `;


    return [];

  }

}


/* =====================================================
   ACTION EVENT DELEGATION
===================================================== */

function initializeWritingActions() {

  document.addEventListener(
    "click",
    async function(event) {

      const button =
        event.target.closest(
          ".writing-action"
        );

      if (!button) {
        return;
      }


      const type =
        button.dataset.type;

      const id =
        button.dataset.id;

      const title =
        button.dataset.title || "";


      if (
        button.dataset.action ===
        "comment"
      ) {

        openComment(
          type,
          id
        );

      }


      if (
        button.dataset.action ===
        "copy"
      ) {

        await copyWritingLink(
          type,
          id,
          button
        );

      }


      if (
        button.dataset.action ===
        "share"
      ) {

        await shareWriting(
          type,
          id,
          title,
          button
        );

      }

    }
  );

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


  if (
    !menuToggle ||
    !mainNav
  ) {

    console.error(
      "Menu elements not found."
    );

    return;

  }


  menuToggle.addEventListener(
    "click",
    function(event) {

      event.preventDefault();
      event.stopPropagation();

      mainNav.classList.toggle(
        "active"
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

      mainNav.classList.remove(
        "active"
      );

    }
  );


  mainNav
    .querySelectorAll("a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          function() {

            mainNav.classList.remove(
              "active"
            );

          }
        );

      }
    );

}


/* =====================================================
   YEAR
===================================================== */

function initializeYear() {

  const year =
    document.getElementById(
      "year"
    );

  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

}


/* =====================================================
   REVEAL
===================================================== */

function initializeReveal() {

  const elements =
    document.querySelectorAll(
      `
      .intro-inner,
      .writing-item,
      .story-card,
      .novel-card,
      .quote-container,
      .author-grid
      `
    );


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      element =>
        element.classList.add(
          "show"
        )
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
        threshold: 0.08
      }
    );


  elements.forEach(
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
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    console.log(
      "Shadat Fatih website started."
    );


    initializeMenu();

    initializeYear();

    initializeWritingActions();


    /*
      Load independently.
      একটি table error হলে অন্যগুলো
      আটকে থাকবে না।
    */

    await loadPoetry();

    await loadStories();

    await loadNovels();


    initializeReveal();

  }
);
