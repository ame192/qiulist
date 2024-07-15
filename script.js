
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
    rotationSpeed: '10s',
    fast: false,
    supriseText: '什么东西？点点看',
    firstTime: true,
    timeBeijing: '',
    timeCentralEurope: '',
    timePacific: '',
    showClock: true,
    tablePosition: null,
    last_timer: null,
    live: false,
    shaking:false,
    currentVideoUrl:'',
    isMinimized:false,
    isMaximized:false,
  },
  created() {
    window.addEventListener('scroll', this.handleScroll);
    this.updateClock();
    setInterval(this.updateClock, 1000);
  },
  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  computed: {
    filteredSongs() {
      var searchInputValue = this.searchInput;
      var genreFilter = this.selectedGenre;
      return this.songs.filter(function (song) {
        if (!song) return false;
        var nameMatch = song.name.includes(searchInputValue);
        var artistMatch = song.artist.includes(searchInputValue);
        var genreMatch =  genreFilter=="" ||song.genre === genreFilter || '全部' === genreFilter ;
        return (nameMatch || artistMatch) && genreMatch;
      });
    }
  },
  methods: {
    getTimeForZone(timezone) {
      const options = { hour: '2-digit', minute: '2-digit' };
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, ...options });
      return formatter.format(new Date());
    },
    updateClock() {
      this.timeBeijing = this.getTimeForZone('Asia/Shanghai');
      this.timeCentralEurope = this.getTimeForZone('Europe/Berlin');
      this.timePacific = this.getTimeForZone('America/Los_Angeles');
    },
    setRotationSpeed(speed) 
    {
      if(this.fast){
        this.fast = false;
        this.rotationSpeed = '10s';
      }
    },
    setRotationFast() 
    {
      this.fast = true;
      var speed = '0.05s';
      this.rotationSpeed = speed;
    },
    stopRotationSpeed() {
      this.fast = false;
      this.rotationSpeed = '10s';
    },
    copyQQToClipboard(songName) {
      var tempInput = document.createElement("input");
      tempInput.setAttribute("value", songName);
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      this.copiedSongName = songName;
      this.showCopyConfirmation = true;
      this.$nextTick( ()=>{document.querySelector('.copy-confirmation').classList.add('show');});

      if (this.last_timer) clearTimeout(this.last_timer);
      this.last_timer = setTimeout(() => {
        this.$nextTick(() => { document.querySelector('.copy-confirmation').classList.remove('show'); });
      }, 2000);
      console.log('Song name copied to the clipboard:', songName);
    },
    copyToClipboard(songName) {
      var tempInput = document.createElement("input");
      tempInput.setAttribute("value", "点歌 " + songName);
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      this.showCopyConfirmation = true;
      this.copiedSongName = "点歌 " + songName;
      this.$nextTick( ()=>{document.querySelector('.copy-confirmation').classList.add('show');});
      if (this.last_timer) clearTimeout(this.last_timer);
      // Hide the confirmation message after 3 seconds (adjust as needed)
      this.last_timer = setTimeout(() => {
        this.$nextTick(() => { document.querySelector('.copy-confirmation').classList.remove('show'); });
      }, 2000);
      console.log('Song name copied to the clipboard:', songName);
    },
    parseCSV(file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          this.songs = results.data;
          this.genres = this.getUniqueGenres(this.songs);
          this.genres.push('全部');
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
      window.open(path, '_blank').focus();
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    scrollToList(){
      window.scrollTo({
        top:450, left: 0,
        behavior: 'smooth'
      });
    },
    handleScroll() {
      if (window.scrollY != 0) {
        this.showBackToTop = true;
      } else {
        this.showBackToTop = false;
      }
    },
    copyRandomSongToClipboard() {
      if (this.songs.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.songs.length);
        const randomSong = this.songs[randomIndex];
        this.shakeButton();
        setTimeout( () => {this.copyToClipboard(randomSong.name);}, 450);
        ;
      }

    },
      shakeButton() {
            this.shaking = true;
            this.rotationSpeed = '0.1s';
            setTimeout(() => {
                this.shaking = false;
                this.rotationSpeed = '10s';
            }, 500);
        },
    async fetchData() {
      const response = await fetch('/response.json');
      const data = await response.json();
      this.live = data.data.liveStatus;
    },
    
    toggleVideo(song) {
      const embedUrl = `https://player.bilibili.com/player.html?&autoplay=true&muted=false&isOutside=true&bvid=${song.bvid}&p=1&as_wide=1&noEndPanel=1`;
      if (this.currentVideoUrl !== embedUrl) {
        this.currentVideoUrl = embedUrl;
      }
    },
    stopVideo() {
        this.currentVideoUrl = '';
    },
    toggleMinimize() {
      const container = document.querySelector('.video-player-container');
      if (this.isMinimized) {
        container.classList.remove('minimized','large');
        container.classList.add('medium');
      } else {
        container.classList.remove('medium', 'large');
        container.classList.add('minimized');
        this.isMaximized = false;
      }
      this.isMinimized = !this.isMinimized;
    },
    toggleMaximize() {
      const container = document.querySelector('.video-player-container');
      if (this.isMaximized) {
        container.classList.remove('medium','large');
        container.classList.add('medium');
      } else {
        container.classList.remove('medium', 'minimized');
        container.classList.add('large');
        this.isMinimized = false;
      }
      this.isMaximized = !this.isMaximized;
    },
    resizeVideo(size) {
      const container = document.querySelector('.video-player-container');
      container.classList.remove('small', 'medium', 'large', 'minimized');
      container.classList.add(size);
      this.isMinimized = false; // Reset minimize state when resizing
      this.isMaximized = false;
    },
  },
  mounted() {
    // CSV file path
    var csvFilePath = '/songlist_sort.csv';
    // Make a fetch request to get the CSV file
    fetch(csvFilePath)
      .then(response => response.text())
      .then(data => {
        this.parseCSV(data);
      })
      .catch(error => {
        console.error('Error fetching CSV file:', error);
      });
    this.tablePosition = document.getElementById('song-table').offsetTop;
    this.fetchData();

  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }

});