/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function copyLink() {
  const link = document.getElementById('publicLink').textContent;
  navigator.clipboard.writeText(link).then(() => {
    alert('Link copied to clipboard!');
  });
}
