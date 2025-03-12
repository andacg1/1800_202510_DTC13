import { CalSyncApi } from "./CalSyncApi.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";

async function insertFaqs() {
  const mainContent = document.getElementById("main-content");
  const faqs = await CalSyncApi.getAllFaqs();
  console.log(faqs);
  for (const faq of faqs) {
    const faqEl = document.createElement("div");
    faqEl.classList.add(
      "flex",
      "flex-col",
      "justify-center",
      "w-full",
      "gap-1",
    );
    faqEl.innerHTML = `
    <h3 class="font-semibold text-2xl">${faq.title}</h3>
    <div class="mb-4">${faq.description}</div>
    `;
    mainContent?.appendChild(faqEl);
  }
}

async function initSupportPage() {
  insertFaqs();
}

safeOnLoad(initSupportPage);
