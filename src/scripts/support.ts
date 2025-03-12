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
      faqItem.classList.add("border-b", "pb-2", "pt-2"); // Add some styling (optional)
      faqItem.innerHTML = `
        <h3 class="font-semibold text-2xl">${faq.title}</h3>
        <p>${faq.description}</p>
      `;
  
      faqList.appendChild(faqItem); // Append to the <ul> with ID "FAQs"
    }
  }
  
  // Initialize when the page loads
  async function initSupportPage() {
    insertFaqs();
  }
  
  safeOnLoad(initSupportPage);