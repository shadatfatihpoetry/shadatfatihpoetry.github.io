const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("active");
});

document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("active");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll(
  ".intro-inner, .writing-card, .story-card, .novel-content, .quote-container, .author-grid"
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.12
  }
);

revealElements.forEach(element => {
  element.classList.add("reveal");
  observer.observe(element);
});

.reveal {
  opacity: 0;
  transform: translateY(35px);
  transition: opacity .8s ease, transform .8s ease;
}

.reveal.show {
  opacity: 1;
  transform: translateY(0);
}
