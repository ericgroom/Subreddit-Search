const SORT = ["relevance", "new", "top", "comments"]
const SORT_SUB = ["hot", "new", "rising", "controversial", "top", "gilded", "wiki"]
const TIME = ["all", "day", "week", "month", "year"]

browser.omnibox.setDefaultSuggestion({
  description: `Search a specific subreddit for a query | e.g. "sub python test time:week" searches r/python for "test" for posts in the last week`
})

browser.omnibox.onInputChanged.addListener((input, suggest) => {
  let suggestion = buildDescription(input)
  browser.omnibox.setDefaultSuggestion({ description: suggestion })
  suggest(buildSuggestions(input))
})

browser.omnibox.onInputEntered.addListener((text, disposition) => {
  let url = buildURL(text)
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

function buildURL(rawText) {
  const { subreddit, queryArray, params } = parseRawText(rawText)
  const query = queryArray.join('+')
  let url = "https://www.reddit.com/"

  if (subreddit && !query) {
    url += `r/${subreddit}/`

    if (params.sort) {
      url += `${params.sort}/`
    }
  }

  if (query) {
    url += `r/${subreddit}/search?q=${query}&restrict_sr=on`

    if (params.sort) {
      url += `&sort=${params.sort}`
    }

    if (params.time) {
      url += `&t=${params.time}`
    }

  }

  return url
}

function buildDescription(rawText) {
  let description = ""
  const { subreddit, queryArray, params } = parseRawText(rawText)
  const query = queryArray.join(' ')

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

  return description
}

function buildSuggestions(rawText) {
  let suggestions = []
  const { subreddit, queryArray, params } = parseRawText(rawText)
  const query = queryArray.join(' ')

  if (params.sort === undefined && params.time == undefined) {
    let sortSuggestion = `${rawText} sort:new`
    let timeSuggestion = `${rawText} time:week`
    sortSuggestion = {
      content: sortSuggestion,
      description: buildDescription(sortSuggestion),
    }
    timeSuggestion = {
      content: timeSuggestion,
      description: buildDescription(timeSuggestion),
    }
    suggestions.push(sortSuggestion)
    suggestions.push(timeSuggestion)
  } else if (params.sort !== undefined) {
    const sortTypes = query ? SORT : SORT_SUB
    sortTypes.map(type => `${rawText} sort:${type}`)
        .map(content => ({content, description: buildDescription(content)}))
        .forEach(suggestion => suggestions.push(suggestion))
  } else if (params.time !== undefined && query) {
    TIME.map(type => `${rawText} time:${type}`)
        .map(content => ({content, description: buildDescription(content)}))
        .forEach(suggestion => suggestions.push(suggestion))
  }
  return suggestions
}

function parseRawText(rawText) {
  const args = rawText.split(" ")
  const subreddit = args.shift()
  const params = args.filter(token => token.includes(':'))
                   .map(param => param.split(':'))
                   .reduce((obj, param) => { // reduce to single object
                      obj[param[0]] = param[1]
                      return obj
                    }, {})
  const queryArray = args.filter(arg => !arg.includes(':'))
  return { subreddit, queryArray, params }
}

