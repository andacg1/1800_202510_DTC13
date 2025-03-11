import safeOnLoad from "./lib/safeOnLoad.ts";

function addSearchListener() {
  const searchEl = document.getElementById('event-search-input') as HTMLInputElement
  searchEl.addEventListener('keyup', () => {
    const value = searchEl.value

  })
}

async function initSearchPage() {
  addSearchListener()
}

safeOnLoad(initSearchPage);
