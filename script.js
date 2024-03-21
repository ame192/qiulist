var app = new Vue({
    el: '#app',
    data: {
        searchInput: '',
        selectedGenre: '',
        songs: [],
        genres: [],
        showCopyConfirmation: false,
        copiedSongName: '',
        showBackToTop: false,
    },
  created() {
        window.addEventListener('scroll', this.handleScroll);
    },
    destroyed() {
        window.removeEventListener('scroll', this.handleScroll);
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
      tempInput.setAttribute("value", "点歌 " + songName);
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      this.showCopyConfirmation = true;
      this.copiedSongName = "点歌 " + songName;
          // Hide the confirmation message after 3 seconds (adjust as needed)
          setTimeout(() => {
              this.showCopyConfirmation = false;
          }, 3000);
    console.log('Song name copied to the clipboard:', songName);
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
      //window.location.href = path;
      window.open(path,'_blank').focus();
    },
    scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
    },
    handleScroll() {
            if (window.pageYOffset != 0) {
                this.showBackToTop = true;
            } else {
                this.showBackToTop = false;
            }
    },
    copyRandomSongToClipboard(){
      if(this.songs.length>0){
        const randomIndex = Math.floor(Math.random()*this.songs.length);
        const randomSong = this.songs[randomIndex];
        this.copyToClipboard(randomSong.name);
      }

    },
    
  },
  mounted() {
    // CSV file path
    var csvFilePath = '/songlist.csv';

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