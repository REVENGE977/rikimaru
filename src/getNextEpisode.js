const endeavor = require("endeavor");
const countdown = require("./countdown.js");
const moment = require("moment");

function getNextEpisode(anime, message, dm = false) {
  const query = `query ($id: Int, $page: Int, $perPage: Int, $search: String, $type: MediaType) {
    Page (page: $page, perPage: $perPage) {
      media (id: $id, search: $search, type: $type) {
        coverImage {
          large
        }
        id
        idMal
        title {
          romaji,
          english,
          native
        }
        type
        status
        updatedAt
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        episodes
        nextAiringEpisode {
          episode
          airingAt
          timeUntilAiring
        }
      }
    }
  }`;
  const variables = {
    search: anime,
    page: 1,
    perPage: 100,
    type: "ANIME"
  };
  const callAnilist = async () => {
    const result = await endeavor.queryAnilist({ query, variables });

    const ongoingEntries = [];
    const unknownUnreleasedEntries = [];
    const unreleasedEntries = [];
    const completedEntries = [];
    result.data.Page.media.forEach(element => {
      console.log(element);
      let _anime = getTitle(element.title);
      let _time = "Unknown";
      let _episode = -1;
      let _endDate
      let _startDate
      const _updatedAt = moment.unix(element.updatedAt);
      if (element.status === "FINISHED") {
        try {
          _endDate = moment(
            `${element.endDate.year}-${element.endDate.month}-${
              element.endDate.day
            }`
          ).format("YYYY MMM D");
          _startDate = moment(
            `${element.startDate.year}-${element.startDate.month}-${
              element.startDate.day
            }`
          ).format("YYYY MMM D");
        } catch (error) {
          console.log("...");
        }
      }
      if (element.nextAiringEpisode !== null) {
        _time = element.nextAiringEpisode.timeUntilAiring;
        _episode = element.nextAiringEpisode.episode;
      }
      if (
        element.status === "RELEASING" &&
        element.nextAiringEpisode !== null
      ) {
        ongoingEntries.push({
          MalId: element.idMal,
          AnimeName: _anime,
          AnimeCountdown: countdown(_time),
          CurrentEpisode: _episode,
          EndDate: null,
          StartDate: _startDate,
          UpdatedAt: moment(_updatedAt).fromNow(),
          Thumbnail: element.coverImage.large
        });
        return;
      }
      if (
        element.status === "NOT_YET_RELEASED" &&
        element.nextAiringEpisode !== null
      ) {
        unreleasedEntries.push({
          MalId: element.idMal,
          AnimeName: _anime,
          AnimeCountdown: countdown(_time),
          CurrentEpisode: _episode,
          EndDate: null,
          StartDate: null,
          UpdatedAt: moment(_updatedAt).fromNow()
        });
        return;
      } 
      if (
        element.status === "NOT_YET_RELEASED" &&
        element.nextAiringEpisode === null
      ) {
        unknownUnreleasedEntries.push({
          MalId: element.idMal,
          AnimeName: _anime,
          AnimeCountdown: null,
          CurrentEpisode: null,
          EndDate: null,
          StartDate: null,
          UpdatedAt: moment(_updatedAt).fromNow()
        });
        return;
      }
      if (
        element.status === "FINISHED" &&
        (element.episodes !== null || element !== element.nextAiringEpisode)
      ) {
        completedEntries.push({
          MalId: element.idMal,
          AnimeName: _anime,
          AnimeCountdown: countdown(_time),
          CurrentEpisode: _episode,
          EndDate: _endDate,
          StartDate: _startDate,
          UpdatedAt: moment(_updatedAt).fromNow()
        });
      }
    });

    function sendMessage(embedMessage) {
      dm ? message.author.send(embedMessage) : message.reply(embedMessage);
    }

    if (ongoingEntries.length > 0) {
      for (let i = 0; i < ongoingEntries.length; i++) {
        const element = ongoingEntries[i];
        const responseMessage = {
          embed: {
            color: 16408534,
            thumbnail: {
              url: element.Thumbnail,
            },
            title: `***${element.AnimeName}***`,
            url: `https://myanimelist.net/anime/${element.MalId}/`,
            fields: [
              {
                name: `*Episode ${element.CurrentEpisode}*`,
                value: `Will air in approximately **${
                  element.AnimeCountdown
                }**\n Last update: *${element.UpdatedAt}*`
              }
            ]
          }
        };
        sendMessage(responseMessage);
      }
      return;
    } 
    if (unreleasedEntries.length > 0) {
      for (let i = 0; i < unreleasedEntries.length; i++) {
        const element = unreleasedEntries[i];
        const responseMessage = {
          embed: {
            color: 8646732,
            title: `***${element.AnimeName}***`,
            url: `https://myanimelist.net/anime/${element.MalId}/`,
            fields: [
              {
                name: `*Not Yet Aired*`,
                value: `Will start airing in approximately **${
                  element.AnimeCountdown
                }**\n Last update: *${element.UpdatedAt}*`
              }
            ]
          }
        };
        sendMessage(responseMessage);
      }
      return;
    } 
    if (unknownUnreleasedEntries.length > 0) {
      for (let i = 0; i < unknownUnreleasedEntries.length; i++) {
        const element = unknownUnreleasedEntries[i];
        const responseMessage = {
          embed: {
            color: 6513633,
            title: `***${element.AnimeName}***`,
            url: `https://myanimelist.net/anime/${element.MalId}/`,
            fields: [
              {
                name: `*Not Yet Aired*`,
                value: `The release date is **currently unknown.**\n Last update: *${
                  element.UpdatedAt
                }*`
              }
            ]
          }
        };
        sendMessage(responseMessage);
      }
      return;
    } 
    if (completedEntries.length > 0) {
      if (completedEntries.length === 1) {
        const element = completedEntries[0];
        const responseMessage = {
          embed: {
            color: 11652146,
            title: `***${element.AnimeName}***   `,
            url: `https://myanimelist.net/anime/${element.MalId}/`,
            fields: [
              {
                name: `*Already Completed!*`,
                value: `Aired: **${element.StartDate}**  to  **${
                  element.EndDate
                }**`
              }
            ]
          }
        };
        sendMessage(responseMessage);
        return;
      }
      let resultString = 'Result';
      if (completedEntries.length != 1) resultString = 'Results'
      var responseMessage = {
        embed: {
          color: 11652146,
          title: `${resultString} for keyword ***${anime}***:`,
          fields: [
            {
              name: `*${completedEntries.length} Anime*`,
              value: `All of the found anime are finished.`
            }
          ]
        }
      };
      sendMessage(responseMessage);
      const responseMessage = {
        embed: {
          color: 11652146,
          title: `Result for keyword ***${anime}***   .`,
          fields: [
            {
              name: `*${completedEntries.length} Anime*`,
              value: `All of them is already completed.`
            }
          ]
        }
      };
      sendMessage(responseMessage);
      return;
    }
    const responseMessage = `Go me nasai! I didn't find "***${anime}***". Try checking your spelling or enter a different keyword.`;
    sendMessage(responseMessage);
  };

  callAnilist();

  function getTitle(title) {
    if (title.english !== null) {
      return title.english.toString();
    }
    return title.romaji.toString();
  }
}

module.exports = getNextEpisode;
