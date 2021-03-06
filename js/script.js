(function ($) {
  const CONSTANTS = {
    BG_COLORS: ['primary', 'success', 'danger', 'warning', 'info'],
    SIZES: ['empty', 'lg', 'md', 'sm'],
    MAX_SQUARE: 24,
    CREATING_LOOP: 20,
    TIME_SECONDS: 60
  };
  let creatingLoop = CONSTANTS.CREATING_LOOP;
  let seconds = CONSTANTS.TIME_SECONDS;
  let started = false;
  let countdown = null;
  let currentResult = 0;
  let results = [];

  function randomInteger(min = 0, max = 2) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);

    return Math.round(rand);
  }

  function createSquare(color = 'transparent', point = 0) {
    const squareNode = $('#zero_square').clone();
    const classNames = `_square square-${CONSTANTS.SIZES[point]} ${point && `border border-secondary rounded`} bg-${color}`

    squareNode
        .removeAttr('id')
        .addClass(classNames)
        .data('point', point)
        .html(point !== 0 && point);

    return squareNode;
  }

  function addSquares(times, newGame = false) {
    const container = $('._playingField');

    if(newGame) {
      $('._square').remove();
    }

    for (let i = 1; i <= times; i++) {
      const point = randomInteger(1, CONSTANTS.SIZES.length - 1);
      const color = CONSTANTS.BG_COLORS[randomInteger(0, CONSTANTS.BG_COLORS.length - 1)];

      if(i % 3 === 0) {
        container.append(createSquare());
      } else {
        container.append(createSquare(color, point));
      }
    }
  }

  function createPlayer(name, result) {
    const playerNode = $('#zero_player').clone();

    playerNode
        .removeAttr('id')
        .addClass('_player')
        .find('._name')
        .html(name)
        .end()
        .find('._result')
        .html(result)
        .end()
        .appendTo($('._results'));
  }

  function getResults() {
    let keys = Object.keys(localStorage);

    for(let key of keys) {
      results.push({
        name: key,
        result: localStorage.getItem(key)
      })
    }

    showResults(results);
  }

  function showResults(arr) {
    $('._player').remove();

    sortResults(arr).forEach((item) => createPlayer(item.name, item.result));
  }

  function sortResults(arr) {
    return arr.sort((a, b) => +a.result < +b.result ? 1 : -1);
  }

  function setResults(name, result) {
    localStorage.setItem(name, result);

    results.push({
      name: name,
      result: result
    });

    showResults(results);
  }

  function timer(time) {
    const timerContainer = $('._timer');
    const seconds = time % 60;
    const minutes = time / 60 % 60;
    let strTimer = `0${Math.trunc(minutes)}:${seconds > 9 ? seconds : `0` + seconds}`;

    timerContainer.html(strTimer);
  }

  function handleStartClick() {
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
  }

  function handleNewGameClick() {
    clearInterval(countdown);
    seconds = CONSTANTS.TIME_SECONDS;
    creatingLoop = CONSTANTS.CREATING_LOOP;
    currentResult = 0;

    $('._playingField').removeClass('active');
    $('._point').html(currentResult);
    $('._start').html('Start');
    addSquares(creatingLoop, true);
    timer(seconds)
  }

  function handleSquareClick() {
    const $this = $(this);
    const count = randomInteger();
    const firstElem = $('._playingField').find('._square')[0];

    if($this.hasClass('square-empty')) return;

    currentResult = currentResult + $this.data('point');
    --creatingLoop;

    if($(firstElem).hasClass('square-empty')) {
      $(firstElem).remove();
      --creatingLoop;
    }

    $this.remove();

    if(creatingLoop + count < CONSTANTS.MAX_SQUARE) {
      creatingLoop = creatingLoop + count;

      addSquares(count);
    }

    $('._point').html(currentResult);
  }

  function setModalData() {
    $('._savingResult').html(`${currentResult} points`);
    $('input[name="player-name"]').focus();
  }

  function saveResult() {
    const input = $('input[name="player-name"]');

    setResults(input.val(), currentResult);

    input.val('');

    handleNewGameClick();
    $('#saveResult').modal('hide');
  }

  function clearResult() {
    localStorage.clear();
    $('._player').remove();
  }

  $(document).ready(function () {
    addSquares(creatingLoop);
    getResults();

    $('._start').on('click', handleStartClick);

    $('._newGame, ._close').on('click', handleNewGameClick);

    $('._playingField').on('click', '._square', handleSquareClick);

    $('#saveResult').on('show.bs.modal', setModalData);

    $('._save').on('click', saveResult);

    $('._clear').on('click', clearResult);
  });
})(jQuery);
