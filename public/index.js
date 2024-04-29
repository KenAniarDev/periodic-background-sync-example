const apiKeyNews = "51b9ecb03f7c4d6489a1b6b225564c43"; // replace with API key from newsapi.org

const createArticleElement = (article) => {
  const element = document.createElement("h3");
  element.textContent = article.title;
  const linkElement = document.createElement("a");
  linkElement.href = article.url;
  linkElement.appendChild(element);

  return linkElement;
};

const setLastFetchedDate = (formattedTime) => {
  const element = document.getElementById("last-fetched");
  element.textContent = formattedTime;
};

const fetchNews = async () => {
  const url = `http://newsapi.org/v2/everything?q=bitcoin&sortBy=publishedAt&apiKey=${apiKeyNews}`;
  const response = await fetch(url);
  return response.json();
};

const main = async () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js");
  }
  const news = await fetchNews();
  if (news.formattedTime) {
    setLastFetchedDate(news.formattedTime);
  }

  const articles = news.articles;
  if (articles && articles.length) {
    const newsElement = document.getElementById("news");
    if (!newsElement) return;

    articles.forEach((article) => {
      newsElement.appendChild(createArticleElement(article));
    });
  }

  const registration = await navigator.serviceWorker.ready;
  console.log("registration", registration);
  // Check if periodicSync is supported
  if ("periodicSync" in registration) {
    // Request permission
    const status = await navigator.permissions.query({
      name: "periodic-background-sync",
    });
    console.log("status", status);

    if (status.state === "granted") {
      try {
        // Register new sync every 24 hours
        await registration.periodicSync.register("news", {
          minInterval: 60 * 1000,
        });
        console.log("Periodic background sync registered!");
      } catch (e) {
        console.error(`Periodic background sync failed:\nx${e}`);
      }
    } else {
      console.info("Periodic background sync is not granted.");
    }
  } else {
    console.log("Periodic background sync is not supported.");
  }
};

main();
