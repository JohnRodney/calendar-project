import React from 'react';
import $ from 'jquery';
import moment from 'moment';
import matrices from '../matrices/matrices';
/* -------------------------------------------------------------- Documentation ---------------------------------------------------------------------------------
// ToggleCalendar is a div button but will later just become a callable class when integrated into the larger project
// registeredEvents: defaults to false this is a flag so that jQuery events are only registered once
// render(): the react render hook
// handleClick(): this function toggles the calendar when the rendered component is clicked
// registerEvents(): this function registers all events once AFTER the calendar enters the DOM
// removeSelected(): this function removes slection before applying a new one since only one day can be selected across two calendar components
// cleanUpLoop(): helper to cut down code since cleanup has to run on both components.
// cleanUp(): basicly disables days of the month that aren't part of that month and clears the numbers rendered there leaving a more clear month to month calendar
// -------------------------------------------------------------------------------------------------------------------------------------------------------------*/

export default React.createClass({
  registeredEvents: false,
  componentDidMount(){
    var that = this;
    setTimeout(function(){that.handleClick();}, 200);
  },
  render(){
    return (
      React.createElement('div')
    );
  },
  handleClick(){
    var target = $('.calendar-area');
    if(target.css('display') === "none"){
      target.show();
      $('.fc-today-button').trigger('click');
      $('.jquery-calendar-right .fc-next-button').trigger('click');
      $('.fc-toolbar').hide();
      $('.jquery-calendar-left').fullCalendar('gotoDate', matrices.earliestMoveIn);
      $('.jquery-calendar-right').fullCalendar('gotoDate', matrices.earliestMoveIn);
      $('.jquery-calendar-right .fc-next-button').trigger('click');
      $('#cal-go-left').css('background-color', '#afafaf');
    }
    else{
      target.hide();
    }
    if(!this.registeredEvents){
      this.registeredEvents = true;
      this.registerEvents();
    }
    else{
      this.cleanUp();
    }
  },
  registerEvents(){
    var rightNext = $('.jquery-calendar-right .fc-next-button');
    var rightPrev = $('.jquery-calendar-right .fc-prev-button');
    var leftNext = $('.jquery-calendar-left .fc-next-button');
    var leftPrev = $('.jquery-calendar-left .fc-prev-button');
    var that = this;
    $('body').on({
      mouseenter: function(e){
        $('body').append("<div class=\"popup-info\">Need to look further in the future? Get in touch with a specialist. (713) 349-2300.</div>");
        var p = $('.popup-info');
        p.css({
          top: ($(this).offset().top+($(this).height()*.1))-$('.popup-info').height(),
          left: ($(this).offset().left + $(this).width()/2)-100});
        p.show();
      },
      mouseleave: function(){
        $('.popup-info').remove();
      }}, '.question-icon');
    // Left Direction navigation
    $('#cal-go-left, .cal-nav-left').click(function(){
      if($('.jquery-calendar-left').fullCalendar('getDate').month() > matrices.earliestMoveIn.month() ||
         $('.jquery-calendar-left').fullCalendar('getDate').year() > matrices.earliestMoveIn.year() ){
        rightPrev.trigger('click');
        leftPrev.trigger('click');
        that.cleanUp();
        $('#cal-go-right').css('background-color', '#8bc832');
        if($('.jquery-calendar-left').fullCalendar('getDate').month() === matrices.earliestMoveIn.month()){
          $('#cal-go-left').css('background-color', '#afafaf');
        }
      }
    });
    // Right Direction navigation
    $('#cal-go-right, .cal-nav-right').click(function(){
      if($('.jquery-calendar-right').fullCalendar('getDate').month() < matrices.lastMoveIn.month() ||
         $('.jquery-calendar-right').fullCalendar('getDate').year() < matrices.lastMoveIn.year()){
        leftNext.trigger('click');
        rightNext.trigger('click');
        that.cleanUp();
        $('#cal-go-left').css('background-color', '#8bc832');
        if($('.jquery-calendar-right').fullCalendar('getDate').month() === matrices.lastMoveIn.month()){
          $('#cal-go-right').css('background-color', '#afafaf');
        }

      }
    });
    // Allow user to select a Date
    $('.calendar-area').on('click', '.selectable', function(){
      that.removeSelected();
      $(this).addClass('cal-selected');
      $('.fc-day-number[data-date='+$(this).attr('data-date')+']').addClass('white');
      that.oldPrice = $(this).html();
      $(this).html("<div class=\"price-holder\"><p>$" + (Number($(this).text().replace(/\+\$/g, '')) + Number($('.base-rent-holder').text().replace(/\$/g, ''))) + "</p></div>" +
                   "<div class=\"check-box\"></div>");
    });
    // Submit the chosen date and lease term on save button click
    $('.calendar-area').on('click', '.calendar-foot button', function(){
      var date = moment($('.cal-selected').attr('data-date'), "YYYY-MM-DD");
      if(typeof(date._i) !== 'undefined'){
        var term = $('.calendar-head select option:selected').text();
        term = term.substring(0, term.indexOf(' '));
        var chosen = matrices.getMatricesByIndex(matrices.getIndexByDate(date));
        $(this).remove();
        $('.calendar-foot').append("<div class=\"loader\">Saving</div>");
        if(chosen.length !== 0){
          matrices.getRedirect(chosen[0]._id);
        }
      }
    });
    // Callback to rerender the calendar with the lease term is changed slightly hacky but couldn't find a better method yet
    $('.calendar-head select').change(function(){
      var term = $('.calendar-head select option:selected').text();
      term = term.substring(0, term.indexOf(' '));
      matrices.setActiveLease(Number(term));
      leftNext.trigger('click');
      leftPrev.trigger('click');
      that.handleClick();
      that.handleClick();
    });
    var over = false;
    $(window).resize(function(){
      //$('.jquery-calendar-left, .jquery-calendar-right').fullCalendar('option', 'contentHeight', $('#calendar-left').width()+$('#calendar-left').width()*.1);
      if($('#cal-right-holder').css('display') !== 'none'){
        if(!over){
          that.handleClick();
          that.handleClick();
        }
        $('#cal-left-holder, #cal-right-holder').css('height', $('#calendar-left').width()+$('#calendar-left').width()*0.1+50+'px');
        over = true;
      }
      else{
        if(over){
          that.handleClick();
          that.handleClick();
          leftNext.trigger('click');
          leftPrev.trigger('click');
        }
        setTimeout(function(){
          $('#cal-left-holder').css('height', $('#calendar-left').width()+$('#calendar-left').width()*0.1+50+'px');
        }, 100);
        over = false;
      }
    });
    $('.jquery-calendar-left, .jquery-calendar-right').fullCalendar('option', 'contentHeight', $('#calendar-left').width()+$('#calendar-left').width()*.1);
    if($(window).width() >= 1000){
      over = true;
      $('#cal-left-holder, #cal-right-holder').css('height', $('#calendar-left').width()+$('#calendar-left').width()*0.1+50+'px');
    }
    else{
      over = false;
      $('#cal-left-holder').css('height', $('#calendar-left').width()+$('#calendar-left').width()*0.1+50+'px');
    }
    this.cleanUp();
  },
  removeSelected(){
    if($('.cal-selected').length > 0){
      $('.cal-selected').html(this.oldPrice);
    }
    $('.fc-day, .fc-day-number').removeClass('cal-selected');
    $('.white').removeClass('white');
  },
  cleanUpLoop(selector, compMonth){
    selector.each(function(){
      var month = moment($(this).attr('data-date'), "YYYY-MM-DD");
      if(month.month() !== compMonth){
        $(this).html("");
        $(this).addClass('disabled');
      }
      else if($(this).attr('class').indexOf('disabled') === -1){
        $(this).addClass('selectable');
      }
    });
  },
  cleanUp(){
    var leftMonth = $('.jquery-calendar-left').fullCalendar('getDate').month();
    var rightMonth = $('.jquery-calendar-right').fullCalendar('getDate').month();
    this.cleanUpLoop($(".jquery-calendar-left .fc-day"), leftMonth);
    this.cleanUpLoop($(".jquery-calendar-right .fc-day"), rightMonth);
    $('.disabled').removeClass('light-green');
  }
})
