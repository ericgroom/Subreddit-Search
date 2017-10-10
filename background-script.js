const SORT = ["relevance", "new", "top", "comments"]
const TIME = ["all", "day", "week", "month", "year"]

browser.omnibox.setDefaultSuggestion({
  description: `Search a specific subreddit for a query`
})

browser.omnibox.onInputChanged.addListener((input, suggest) => {
  let s = { content: input, description: "A test of the suggestions" }
  suggest([ s ])
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
  let params = args.filter(token => token.includes(':'))
                   .map(param => param.split(':'))
                   .reduce((obj, param) => { // reduce to single object
                      obj[param[0]] = param[1]
                      return obj
                    }, {})
  console.log(params)
  let query = args.filter(arg => !arg.includes(':')).join('+')
  let url = `https://www.reddit.com/r/${subreddit}/search?q=${query}&restrict_sr=on`
  if (params.sort) {
    url += `&sort=${params.sort}`
  }
  if (params.time) {
    url += `&t=${params.time}`
  }
  return url
}

