/* eslint-disable no-undef */
/* menu.js */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');

  if (!hamburger || !nav) {
    console.warn('Hamburger or nav element not found');
    return;
  }

  hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');

    // Change hamburger icon
    if (nav.classList.contains('active')) {
      hamburger.innerHTML = '&times;'; // × (better than emoji)
    } else {
      hamburger.innerHTML = '&#9776;'; // ☰
    }
  });

  // Close menu when clicking any link
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      hamburger.innerHTML = '&#9776;';
    });
  });

  // Close menu when clicking outside (optional but nice)
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('active');
      hamburger.innerHTML = '&#9776;';
    }
  });
});
