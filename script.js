/* =====================================================
   SHADAT FATIH — LITERARY ARCHIVE
   FINAL SCRIPT
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

    mainNav.setAttribute(
      "aria-hidden",
      isOpen ? "false" : "true"
    );

  });


  mainNav.querySelectorAll("a").forEach(link => {

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


  /* submenu */

  document
    .querySelectorAll("[data-toggle]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const targetId =
          button.dataset.toggle;

        const submenu =
          document.getElementById(targetId);

        if (!submenu) return;

        submenu.classList.toggle("open");

        const arrow =
          button.querySelector(".menu-arrow");

        if (arrow) {

          arrow.textContent =
            submenu.classList.contains("open")
              ? "−"
              : "+";

        }

      });

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
   ESCAPE HTML
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
   TYPE URL
===================================================== */

function getContentUrl(type, id) {

  const pages = {

    poem: "poem.html",
    story: "story.html",
    novel: "novel.html"

  };

  const page =
    pages[type] || "index.html";

  return `${page}?id=${encodeURIComponent(id)}`;

}


/* =====================================================
   ABSOLUTE SHARE URL
===================================================== */

function getShareUrl(type, id) {

  return new URL(
    getContentUrl(type, id),
    window.location.href
  ).href;

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

    textarea.style.position =
      "fixed";

    textarea.style.opacity =
      "0";

    document.body.appendChild(
      textarea
    );

    textarea.focus();
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


  await copyLink(url);

}


/* =====================================================
   COMMENT MODAL
===================================================== */

function openComment(
  type,
  id,
  title = ""
) {

  let overlay =
    document.getElementById(
      "commentOverlay"
    );


  if (!overlay) {

    overlay =
      createCommentModal();

  }


  const contentType =
    overlay.querySelector(
      "#commentContentType"
    );

  const contentId =
    overlay.querySelector(
      "#commentContentId"
    );

  const titleInput =
    overlay.querySelector(
      "#commentContentTitle"
    );

  if (contentType) {
    contentType.value = type;
  }

  if (contentId) {
    contentId.value = id;
  }

  if (titleInput) {
    titleInput.value = title;
  }


  overlay.classList.add("active");

  document.body.style.overflow =
    "hidden";

}


/* =====================================================
   CREATE COMMENT MODAL
===================================================== */

function createCommentModal() {

  const overlay =
    document.createElement("div");

  overlay.id =
    "commentOverlay";

  overlay.className =
    "comment-overlay";


  overlay.innerHTML = `

    <div
      class="comment-box"
      role="dialog"
      aria-modal="true"
      aria-labelledby="commentTitle"
    >

      <button
        type="button"
        class="comment-close"
        onclick="closeComment()"
        aria-label="Close"
      >
        ×
      </button>


      <h3 id="commentTitle">
        মন্তব্য করুন
      </h3>


      <p class="comment-box-subtitle">
        আপনার মতামত আমাদের জানান।
      </p>


      <form id="commentForm">

        <input
          type="hidden"
          id="commentContentType"
        >

        <input
          type="hidden"
          id="commentContentId"
        >

        <input
          type="hidden"
          id="commentContentTitle"
        >


        <div class="comment-form-group">

          <label>
            আপনার নাম
          </label>

          <input
            type="text"
            id="commentName"
            maxlength="100"
            required
            placeholder="আপনার নাম"
          >

        </div>


        <div class="comment-form-group">

          <label>
            আপনার ইমেইল
          </label>

          <input
            type="email"
            id="commentEmail"
            maxlength="160"
            required
            placeholder="example@email.com"
          >

        </div>


        <div class="comment-form-group">

          <label>
            মন্তব্য
          </label>

          <textarea
            id="commentMessage"
            maxlength="2000"
            required
            placeholder="আপনার মন্তব্য লিখুন..."
          ></textarea>

        </div>


        <div class="comment-submit-row">

          <button
            type="button"
            class="comment-cancel"
            onclick="closeComment()"
          >
            বাতিল
          </button>


          <button
            type="submit"
            class="comment-submit"
          >
            মন্তব্য পাঠান
          </button>

        </div>

      </form>

    </div>

  `;


  document.body.appendChild(
    overlay
  );


  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target === overlay
      ) {

        closeComment();

      }

    }
  );


  document
    .getElementById("commentForm")
    .addEventListener(
      "submit",
      submitComment
    );


  return overlay;

}


/* =====================================================
   CLOSE COMMENT
===================================================== */

function closeComment() {

  const overlay =
    document.getElementById(
      "commentOverlay"
    );


  if (overlay) {

    overlay.classList.remove(
      "active"
    );

  }

  document.body.style.overflow =
    "";

}


/* =====================================================
   SUBMIT COMMENT
===================================================== */

async function submitComment(event) {

  event.preventDefault();


  const type =
    document.getElementById(
      "commentContentType"
    ).value;

  const contentId =
    document.getElementById(
      "commentContentId"
    ).value;

  const contentTitle =
    document.getElementById(
      "commentContentTitle"
    ).value;


  const name =
    document.getElementById(
      "commentName"
    ).value.trim();


  const email =
    document.getElementById(
      "commentEmail"
    ).value.trim();


  const message =
    document.getElementById(
      "commentMessage"
    ).value.trim();


  if (
    !name ||
    !email ||
    !message ||
    !type ||
    !contentId
  ) {

    showToast(
      "সব তথ্য পূরণ করুন"
    );

    return;

  }


  const submitButton =
    event.target.querySelector(
      ".comment-submit"
    );


  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.textContent =
      "পাঠানো হচ্ছে...";

  }


  try {

    /*
      IMPORTANT:

      Your Supabase project must have
      a comments table with columns:

      id
      content_type
      content_id
      content_title
      name
      email
      message
      created_at
      approved

    */


    const {
      error
    } =
      await window.supabaseClient
        .from("comments")
        .insert({

          content_type: type,

          content_id: contentId,

          content_title:
            contentTitle,

          name: name,

          email: email,

          message: message,

          approved: false

        });


    if (error) {

      throw error;

    }


    showToast(
      "মন্তব্য পাঠানো হয়েছে"
    );


    document
      .getElementById(
        "commentForm"
      )
      .reset();


    setTimeout(
      closeComment,
      900
    );


  } catch (error) {

    console.error(
      "Comment Error:",
      error
    );


    showToast(
      "মন্তব্য পাঠানো যায়নি"
    );

  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.textContent =
        "মন্তব্য পাঠান";

    }

  }

}


/* =====================================================
   ACTION BUTTONS
===================================================== */

function actionButtons(
  type,
  item
) {

  const id =
    item.id;

  const title =
    escapeHtml(
      item.title || ""
    );

  const url =
    getShareUrl(
      type,
      id
    );


  return `

    <div class="writing-actions premium-actions">

      <button
        type="button"
        class="action-btn premium-action"
        onclick="openComment(
          '${escapeHtml(type)}',
          '${escapeHtml(String(id))}',
          '${title}'
        )"
      >
        ✦ Comment
      </button>


      <button
        type="button"
        class="action-btn premium-action"
        onclick="shareContent(
          '${title.replaceAll("'", "\\'")}',
          '${url}'
        )"
      >
        ✦ Share
      </button>


      <button
        type="button"
        class="action-btn premium-action"
        onclick="copyLink(
          '${url}'
        )"
      >
        ✦ Copy Link
      </button>

    </div>

  `;

}


/* =====================================================
   TOTAL VIEWS
===================================================== */

function totalViews(item) {

  const views =
    Number(item.views || 0);


  return `

    <div
      class="total-views"
      title="Total Views"
    >

      <span>
        VIEWS
      </span>

      <strong>
        ${views.toLocaleString("en-US")}
      </strong>

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
          "id,title,content,excerpt,created_at,published,views"
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

        <div class="empty-state">

          <p>
            এখনো কোনো প্রকাশিত কবিতা নেই।
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      data.map(
        (poem, index) => `

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


              <div class="card-bottom">

                <a
                  href="${getContentUrl(
                    "poem",
                    poem.id
                  )}"
                  class="text-link"
                >
                  কবিতা পড়ুন →
                </a>

              </div>


              ${actionButtons(
                "poem",
                poem
              )}

            </div>

          </article>

        `
      ).join("");


    initReveal();

  } catch (error) {

    console.error(
      "Poetry Error:",
      error
    );


    container.innerHTML = `

      <div class="error-state">

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
          "id,title,excerpt,content,created_at,published,views"
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

        <div class="story-card">

          <span>
            STORIES
          </span>

          <h3>
            এখনো কোনো প্রকাশিত গল্প নেই
          </h3>

          <p>
            নতুন গল্প খুব শীঘ্রই প্রকাশিত হবে।
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      data.map(
        (story, index) => `

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


            <div class="card-bottom">

              <a
                href="${getContentUrl(
                  "story",
                  story.id
                )}"
                class="text-link"
              >
                গল্প পড়ুন ↗
              </a>

            </div>


            ${actionButtons(
              "story",
              story
            )}

          </article>

        `
      ).join("");


    initReveal();

  } catch (error) {

    console.error(
      "Stories Error:",
      error
    );


    container.innerHTML = `

      <div class="story-card error-state">

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
          "id,title,content,excerpt,created_at,published,views"
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

        <div class="novel-card">

          <p class="card-label">
            NOVELS
          </p>

          <h3>
            এখনো কোনো প্রকাশিত উপন্যাস নেই
          </h3>

          <p>
            নতুন উপন্যাস খুব শীঘ্রই প্রকাশিত হবে।
          </p>

        </div>

      `;

      return;

    }


    container.innerHTML =
      data.map(
        (novel, index) => `

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


              <div class="card-bottom">

                <a
                  href="${getContentUrl(
                    "novel",
                    novel.id
                  )}"
                  class="text-link"
                >
                  উপন্যাস পড়ুন →
                </a>

              </div>


              ${actionButtons(
                "novel",
                novel
              )}

            </div>

          </article>

        `
      ).join("");


    initReveal();

  } catch (error) {

    console.error(
      "Novels Error:",
      error
    );


    container.innerHTML = `

      <div class="novel-card error-state">

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


    renderArchiveList(
      "yearPoemsList",
      poemsResult.data || [],
      "poem"
    );


    renderArchiveList(
      "yearStoriesList",
      storiesResult.data || [],
      "story"
    );


    renderArchiveList(
      "yearNovelsList",
      novelsResult.data || [],
      "novel"
    );


  } catch (error) {

    console.error(
      "Yearly Archive Error:",
      error
    );

    [
      "yearPoemsList",
      "yearStoriesList",
      "yearNovelsList"
    ].forEach(id => {

      const element =
        document.getElementById(id);

      if (element) {

        element.innerHTML = `
          <p class="archive-empty">
            আর্কাইভ লোড করা যায়নি।
          </p>
        `;

      }

    });

  }

}


/* =====================================================
   ARCHIVE LIST
===================================================== */

function renderArchiveList(
  elementId,
  items,
  type
) {

  const container =
    document.getElementById(
      elementId
    );


  if (!container) return;


  if (
    !items ||
    items.length === 0
  ) {

    container.innerHTML = `

      <p class="archive-empty">
        এই বিভাগে এখনো কোনো লেখা নেই।
      </p>

    `;

    return;

  }


  container.innerHTML =
    items.map(
      item => `

        <a
          href="${getContentUrl(
            type,
            item.id
          )}"
          class="archive-item"
        >

          <div>

            <span class="archive-date">
              ${formatDate(item.created_at)}
            </span>

            <strong>
              ${escapeHtml(item.title)}
            </strong>

          </div>

        </a>

      `
    ).join("");

}


/* =====================================================
   MOST VIEWED
===================================================== */

async function loadMostViewed() {

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
            "id,title,created_at,published,views"
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
            "id,title,created_at,published,views"
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
            "id,title,created_at,published,views"
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


    renderMostViewedList(
      "mostPoemsList",
      poemsResult.data || [],
      "poem"
    );


    renderMostViewedList(
      "mostStoriesList",
      storiesResult.data || [],
      "story"
    );


    renderMostViewedList(
      "mostNovelsList",
      novelsResult.data || [],
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
   MOST VIEWED LIST
===================================================== */

function renderMostViewedList(
  elementId,
  items,
  type
) {

  const container =
    document.getElementById(
      elementId
    );


  if (!container) return;


  if (
    !items ||
    items.length === 0
  ) {

    container.innerHTML = `

      <p class="archive-empty">
        এখনো কোনো লেখা নেই।
      </p>

    `;

    return;

  }


  container.innerHTML =
    items.map(
      (item, index) => `

        <a
          href="${getContentUrl(
            type,
            item.id
          )}"
          class="most-viewed-item"
        >

          <span class="most-rank">
            ${String(index + 1).padStart(2, "0")}
          </span>


          <div class="most-title">

            <span>
              ${escapeHtml(item.title)}
            </span>

            <small>
              ${formatDate(item.created_at)}
            </small>

          </div>


          <div class="view-count">

            <span>
              VIEWS
            </span>

            <strong>
              ${Number(
                item.views || 0
              ).toLocaleString("en-US")}
            </strong>

          </div>

        </a>

      `
    ).join("");

}


/* =====================================================
   REVEAL
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
      ".archive-block, " +
      ".most-viewed-block"
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
        threshold: 0.05
      }
    );


  elements.forEach(element => {

    if (
      !element.classList.contains(
        "reveal"
      )
    ) {

      element.classList.add(
        "reveal"
      );

    }

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

window.closeComment =
  closeComment;
