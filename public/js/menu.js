/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active');
      hamburger.textContent = nav.classList.contains('active') ? '✖' : '☰';
    });

    // Close when clicking a link
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        hamburger.textContent = '☰';
      });
    });
  }
});
