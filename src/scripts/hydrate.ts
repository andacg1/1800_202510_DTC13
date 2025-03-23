const parser = new DOMParser();

export async function hydrate(src: string, selector: string) {
  try {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const htmlString = await response.text();

    const el = document.querySelector(selector);
    if (!el) {
      console.error(`Could not find element using ${el}`);
    }

    const htmlDoc = parser.parseFromString(htmlString, "text/html");
    if (!htmlDoc?.body?.firstChild) {
      throw new Error(`Template file is empty (${src})`);
    }
    el?.replaceChildren(htmlDoc?.body?.firstChild);

    return Promise.resolve(htmlString);
  } catch (error: any) {
    console.error(error.message);
    return Promise.reject(error.message);
  }
}
