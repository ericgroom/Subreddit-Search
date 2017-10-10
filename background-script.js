browser.omnibox.setDefaultSuggestion({
  description: `Search a specific subreddit for a query`
})

browser.omnibox.onInputEntered.addListener((text, disposition) => {
  let url = BuildURL(text)
  switch (disposition) {
    case "currentTab":
      browser.tabs.update({url});
      break;
    case "newForegroundTab":
      browser.tabs.create({url});
      break;
    case "newBackgroundTab":
      browser.tabs.create({url, active: false});
      break;
  }
})

const BuildURL = (rawText) => {
  let args = rawText.split(" ")
  let subreddit = args.shift()
  let query = args
  query.join('+')
  let url = `https://www.reddit.com/r/${subreddit}/search?q=${query}&restrict_sr=on&sort=relevance&t=all`
  return url
}

