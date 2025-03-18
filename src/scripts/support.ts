import { CalSyncApi } from "./CalSyncApi.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";

async function insertFaqs() {
  const faqList = document.getElementById("FAQs"); // Get the <ul> element

  if (!faqList) {
    console.error("FAQs element not found.");
    return;
  }

  const faqs = await CalSyncApi.getAllFaqs(); // Fetch FAQ data
  console.log(faqs); // Debugging log

  faqList.innerHTML = ""; // Clear previous content

  for (const faq of faqs) {
    const faqItem = document.createElement("li");
    faqItem.classList.add("w-full"); // Add some styling (optional)
    faqItem.innerHTML = `
    <div tabindex="0" class="collapse bg-base-100 border-base-300 border">
      <div class="collapse-title font-semibold">${faq.title}</div>
      <div class="collapse-content text-sm">
        ${faq.description}
      </div>
    </div>
    `;

    faqList.appendChild(faqItem); // Append to the <ul> with ID "FAQs"
  }
}

// Initialize when the page loads
async function initSupportPage() {
  insertFaqs();
}

safeOnLoad(initSupportPage);
