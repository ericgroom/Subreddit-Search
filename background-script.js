const SORT = ["relevance", "new", "top", "comments"]
const TIME = ["all", "day", "week", "month", "year"]

browser.omnibox.setDefaultSuggestion({
  description: `Search a specific subreddit for a query | e.g. "sub python test time:week" searches r/python for "test" for posts in the last week`
})

browser.omnibox.onInputChanged.addListener((input, suggest) => {
  let suggestion = BuildSuggestion(input)
  browser.omnibox.setDefaultSuggestion(suggestion)
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

const parseRawText = (rawText) => {
  const args = rawText.split(" ")
  const subreddit = args.shift()
  const params = args.filter(token => token.includes(':'))
                   .map(param => param.split(':'))
                   .reduce((obj, param) => { // reduce to single object
                      obj[param[0]] = param[1]
                      return obj
                    }, {})
  const query = args.filter(arg => !arg.includes(':'))
  return { subreddit, query, params }
}

const BuildSuggestion = (rawText) => {
  let description = ""
  let { subreddit, query, params } = parseRawText(rawText)
  query = query.join(' ')

  if (subreddit && !query) {
    description += `Go to r/${subreddit}`
  }

  if (query) {
    description += `Search r/${subreddit} for "${query}"`
  }

  if (params.time) {
    description += ` within the last ${params.time}`
  }

  if (params.sort) {
    description += ` and sort by ${params.sort}`
  }

  return { description }
}

const BuildURL = (rawText) => {
  const { subreddit, query, params } = parseRawText(rawText)
  let url = `https://www.reddit.com/r/${subreddit}/search?q=${query.join('+')}&restrict_sr=on`
  if (params.sort) {
    url += `&sort=${params.sort}`
  }
  if (params.time) {
    url += `&t=${params.time}`
  }
  return url
}

