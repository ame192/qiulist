var app = new Vue({
    el: '#app',
    data: {
        searchInput: '',
        selectedGenre: '',
        songs: [],
        genres: [],
    },
    computed: {
        filteredSongs() {
            var searchInputValue = this.searchInput.toLowerCase();
            var genreFilter = this.selectedGenre.toLowerCase();
        
            return this.songs.filter(function(song) {
                var nameMatch = song.name.toLowerCase().includes(searchInputValue);
                var artistMatch = song.artist.toLowerCase().includes(searchInputValue);
                var genreMatch = !genreFilter || song.genre.toLowerCase() === genreFilter;
        
                return (nameMatch || artistMatch) && genreMatch;
            });
        }
    },
  methods: {
    copyToClipboard(songName) {
      var tempInput = document.createElement("input");
      tempInput.setAttribute("value", songName);
      document.body.appendChild(tempInput);
      tempInput.select();

      var clipboard = new ClipboardJS(tempInput);
      clipboard.on("success", () => {
        console.log('Song name copied to the clipboard:', songName);
        clipboard.destroy();
        document.body.removeChild(tempInput);
      });

      tempInput.focus();
      document.execCommand("copy");
    },
    parseCSV(file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          this.songs = results.data;
          this.genres = this.getUniqueGenres(this.songs);
        }
      });
    },
    getUniqueGenres(songs) {
      var genres = [];
      songs.forEach(function (song) {
        if (!genres.includes(song.genre)) {
          genres.push(song.genre);
        }
      });
      return genres;
    },
    navigateTo(path) {
            window.location.href = path;
    },
  },
  mounted() {
    // CSV file path
    var csvFilePath = 'songlist.csv';

    // Make a fetch request to get the CSV file
    fetch(csvFilePath)
      .then(response => response.text())
      .then(data => {
        this.parseCSV(data);
      })
      .catch(error => {
        console.error('Error fetching CSV file:', error);
      });
  }
});