var endeavor = require("endeavor");
var countdown = require("./countdown.js");

function getNextEpisode(anime, message, dm = false) {
  const query = `query ($id: Int, $page: Int, $perPage: Int, $search: String) {
    Page (page: $page, perPage: $perPage) {
      media (id: $id, search: $search) {
        id
        title {
          romaji
        }
        status
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
    perPage: 100
  };
  const callAnilist = async () => {
    const result = await endeavor.queryAnilist({ query, variables });

    var ongoingEntries = [];
    var unreleasedEntries = [];
    var completedEntries = [];
    result.data.Page.media.forEach(element => {
      console.log(element);
      var _anime = element.title.romaji.toString();
      var _time = "Unknown";
      var _episode = -1;
      if (element.nextAiringEpisode !== null) {
        _time = element.nextAiringEpisode.timeUntilAiring;
        _episode = element.nextAiringEpisode.episode;
      }
      if (
        element.status === "RELEASING" &&
        element.nextAiringEpisode !== null
      ) {
        ongoingEntries.push({
          AnimeName: _anime,
          AnimeCountdown: countdown(_time),
          CurrentEpisode: _episode
        });
      } else if (
        element.status === "NOT_YET_RELEASED" &&
        element.nextAiringEpisode !== null
      ) {
        unreleasedEntries.push({
          AnimeName: _anime,
          AnimeCountdown: countdown(_time),
          CurrentEpisode: _episode
        });
      } else if (
        element.status === "FINISHED" &&
        (element.episodes !== null || element !== element.nextAiringEpisode)
      ) {
        completedEntries.push({
          AnimeName: _anime,
          AnimeCountdown: countdown(_time),
          CurrentEpisode: _episode
        });
      }
    });

    function sendMessage(responseMessage) {
      dm
        ? message.author.send(responseMessage)
        : message.reply(responseMessage);
    }

    if (ongoingEntries.length > 0) {
      for (let i = 0; i < ongoingEntries.length; i++) {
        const element = ongoingEntries[i];
        var responseMessage = `*Tachiyotte kurete arigatō!, Episode ${
          element.CurrentEpisode
        }* for "***${element.AnimeName}***"  will come out in **${
          element.AnimeCountdown
        }!**`;
        sendMessage(responseMessage);
      }
    } else if (unreleasedEntries.length > 0) {
      for (let i = 0; i < unreleasedEntries.length; i++) {
        const element = unreleasedEntries[i];
        var responseMessage = `"***${
          element.AnimeName
        }***"  is not yet aired. It will be aired in **${
          element.AnimeCountdown
        }!**`;
        sendMessage(responseMessage);
      }
    } else if (completedEntries.length > 0) {
      if (completedEntries.length === 1) {
        var responseMessage = `*Tachiyotte kurete arigatō!*, "***${
          completedEntries[0].AnimeName
        }***" is already completed!`;
        sendMessage(responseMessage);
      } else {
        var responseMessage = `I found ***${
          completedEntries.length
        } animes*** that matches your keyword "***${anime}***" and all of them is already completed!`;
        sendMessage(responseMessage);
      }
    } else {
      var responseMessage = `Go me nasai! I didn't find "***${anime}***". Try checking your spelling or enter a different keyword.`;
      sendMessage(responseMessage);
    }
  };

  callAnilist();
}

module.exports = getNextEpisode;
