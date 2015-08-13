require! {
  './base-fetcher': BaseFetcher
}

module.exports = class UpcomingEventsFetcher extends BaseFetcher

  all: (callback) !->
    @fetch "http://api.lansing.codes/v1/events/upcoming/list", callback

  search: (query, callback) !->
    @fetch "http://api.lansing.codes/v1/events/upcoming/search/#{encode-URI-component query}", callback
