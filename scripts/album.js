var setSong = function(songNumber) {
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1]
    
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        
        formats: ['mp3'],
        preload: true
        
    });
    
    setVolume(currentVolume);
};

var seek = function(time) {
    if(currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};
    
var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};


var createSongRow = function(songNumber, songName, songLength) {
    var template = 
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>'
      ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (currentlyPlayingSongNumber !== null) {
		  var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		  currentlyPlayingCell.html(currentlyPlayingSongNumber);
	   }
	    if (currentlyPlayingSongNumber !== songNumber) {
		  setSong(songNumber);
          currentSoundFile.play();
          updateSeekBarWhileSongPlays()
          var $volumeFill = $('.volume .fill');
          var $volumeThumb = $('.volume .thumb');
          $volumeFill.width(currentVolume + '%')
          $volumeThumb.css({left: currentVolume + '%'});
          $(this).html(pauseButtonTemplate);
          updatePlayerBarSong();
	   } 
        else if (currentlyPlayingSongNumber === songNumber) {
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();   
            }
        }
    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
    };
    
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);    
        }
    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};



var setCurrentAlbum = function(album) {
    currentAlbum = album;
    
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            setCurrentTimeInPlayerBar(currentTime);
            setTotalTimeInPlayerBar(totalTime)
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);   
        }
        
        updateSeekerPercentage($(this), seekBarFillRatio);
    });
    
    $seekBars.find('.thumb').mousedown(function(event) {
        
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());   
            } else {
                setVolume(seekBarFillRatio);
            }
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        $(document).bind('mouseup.thumb', function() {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};


var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

var nextSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    setSong(currentSongIndex + 1)
    currentSoundFile.play();
    updateSeekBarWhileSongPlays()
    updatePlayerBarSong();

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var previousSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    setSong(currentSongIndex + 1)
    currentSoundFile.play();
    updateSeekBarWhileSongPlays()
    updatePlayerBarSong();

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var songNumber = parseInt(document.getElementsByClassName('.song-item-number'));

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>'
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>'
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    setupSeekBars();
    
    var findParentByClassName = function(element, targetClass) {
        if (element) {
            var currentParent = element.parentElement;
            while (currentParent.className != targetClass && currentParent.className !== null){
                currentParent = currentParent.parentElement;
            }
            return currentParent;
        }
    };
    
    var getSongItem = function(element) {
        switch (element.className) {
            case 'album-song-button':
            case 'ion-play':
            case 'ion-pause':
                return findParentByClassName(element, 'song-item-number');
            case 'album-view-song-item':
                return element.querySelector('.song-item-number');
            case 'song-item-title':
            case 'song-item-duration':
                return findParentByClassName(element, 'album-view-song-item').querySelector('.song-item-number');
            case 'song-item-number':
                return element;
            default:
                return;
        }
    };
    
    var clickHandler = function(targetElement) {
        
        var songItem = getSongItem(targetElement);
        
        if (currentlyPlayingSong === null) {
            songItem.innerHTML = pauseButtonTemplate;
            currentlyPlayingSong = songItem.getAttribute('data-song-number');
        
        } else if (currentlyPlayingSong === songItem.getAttribute('data-song-number')) {
            songItem.innerHTML = playButtonTemplate;
            currentlyPlayingSong = null;
     
        } else if (currentlyPlayingSong !== songItem.getAttribute('data-song-number')) {
            var currentlyPlayingSongElement = document.querySelector('[data-song-number="' + currentlyPlayingSong + '"]');
            currentlyPlayingSongElement.innerHTML = currentlyPlayingSongElement.getAttribute('data-song-number');
            songItem.innerHTML = pauseButtonTemplate;
            currentlyPlayingSong = songItem.getAttribute('data-song-number');
        }
    };
});

var setCurrentTimeInPlayerBar = function(currentTime) {
    $('.current-time').text(filterTimeCode(currentTime));
};

var setTotalTimeInPlayerBar = function(totalTime) {
    $('.total-time').length(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds) {
    timeInSeconds = parseFloat(timeInSeconds)
    var minutes = Math.floor(timeInSeconds / 60).toString();
    var seconds = Math.floor(timeInSeconds % 60).toString();
    
    if (seconds.length < 2) {
        seconds = '0' + seconds;
    }
    
    return minutes + ':' + seconds;
};