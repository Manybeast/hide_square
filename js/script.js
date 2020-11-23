const bgColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];
const sizes = [null, 'lg', 'md', 'sm'];
const maxSquare = 24;
let creatingLoop = 20;
let seconds = 5;
let started = false;
let countdown = null;
let currentResult = 0;

function randomInteger(min = 0, max = 2) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);

  return Math.round(rand);
}

function createSquare(color = 'transparent', point = 0) {
  const square = $('<div/>', {
    'class': `_square square square-${sizes[point]} m-2 text-white h3 ${point && `border border-secondary rounded`} d-flex justify-content-center align-items-center bg-${color}`,
    'data-point': point
  }).html(point && point);

  return square;
}
function addSquares(times, newGame = false) {
  const container = $('._playingField');

  if(newGame) {
    container.html('');
  }


  for (let i = 1; i <= times; i++) {
    const point = randomInteger(1, sizes.length - 1);
    const color = bgColors[randomInteger(0, bgColors.length - 1)];

    if(i % 3 === 0) {
      container.append(createSquare());
    } else {
      container.append(createSquare(color, point));
    }
  }
}

function createPlayer(name, result) {
  const player = $($('._player')[0]).clone();

  player
      .addClass('_reserved')
      .find('._name')
      .html(name)
      .end()
      .find('._result')
      .html(result)
      .end()
      .appendTo($('._results'));
}

function getResult() {
  let keys = Object.keys(localStorage);

  for(let key of keys) {
    createPlayer(key, localStorage.getItem(key));
  }
}

function setResult(name, result) {
  createPlayer(name, result);

  localStorage.setItem(name, result)
}

function timer(time) {
  const timerContainer = $('._timer');
  const seconds = time % 60;
  const minutes = time / 60 % 60;
  let strTimer = `0${Math.trunc(minutes)}:${seconds > 9 ? seconds : `0` + seconds}`;

  timerContainer.html(strTimer);
}

$(document).ready(function () {
  addSquares(creatingLoop);
  getResult();

  $('._start').on('click', function () {
    const playingField = $('._playingField');

    if(started) {
      clearInterval(countdown);
      started = false;
      $(this).html('Start');
      ++seconds;

      playingField.removeClass('active');

      return;
    }

    playingField.addClass('active');

    --seconds;

    countdown = setInterval(function () {
      if (seconds === 0) {
        clearInterval(countdown);

        $('#saveResult').modal();
      } else {
        timer(seconds);
      }
      --seconds;
    }, 1000);

    $(this).html('Pause');

    started = true;
  });

  $('._newGame').on('click', function () {
    clearInterval(countdown);
    seconds = 60;
    creatingLoop = 10;
    currentResult = 0;

    $('._playingField').removeClass('active');
    $('._point').html(currentResult);
    $('._start').html('Start');
    addSquares(creatingLoop, true);
    timer(seconds)
  });

  $('._playingField').on('click', '._square', function (e) {
    const _this = $(this);
    const count = randomInteger();
    const firstElem = $('._playingField').find('.square')[0];

    if(_this.hasClass('square-null')) return;

    currentResult = currentResult + _this.data('point');
    --creatingLoop;

    if($(firstElem).hasClass('square-null')) {
      $(firstElem).remove();
      --creatingLoop;
    }

    _this.remove();

    if(creatingLoop + count < maxSquare) {
      creatingLoop = creatingLoop + count;

      addSquares(count);
    }

    $('._point').html(currentResult);
  });

  $('#saveResult').on('show.bs.modal', function () {
    $('._savingResult').html(`${currentResult} points`);
    $('input[name="player-name"]').focus();
  });

  $('._save').on('click', function () {
    const input = $('input[name="player-name"]');

    setResult(input.val(), currentResult);

    input.val('');

    $('._newGame').click();
    $('#saveResult').modal('hide');
  });

  $('._close').on('click', function () {
    $('._newGame').click();
  });

  $('._clear').on('click', function () {
    localStorage.clear();
    $('._reserved').remove();
  });
});




