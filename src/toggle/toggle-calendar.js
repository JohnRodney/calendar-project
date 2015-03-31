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
  render(){
    return (
      <button onClick={this.handleClick}>Toggle Calendar</button>
    );
  },
  handleClick(){
    var target = $('.calendar-area');
    if(target.css('display') === "none"){
      target.show();
      $('.fc-today-button').trigger('click');
      $('.jquery-calendar-right .fc-next-button').trigger('click');
      $('.fc-toolbar').hide();
    }
    else{
      target.hide();
    }
    if(!this.registeredEvents){
      this.registerEvents();
      this.registeredEvents = true;
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
    // Left Direction navigation
    $('#cal-go-left').click(function(){
      rightPrev.trigger('click');
      leftPrev.trigger('click');
      that.cleanUp();
    });
    // Right Direction navigation
    $('#cal-go-right').click(function(){
      leftNext.trigger('click');
      rightNext.trigger('click');
      that.cleanUp();
    });
    // Allow user to select a Date
    $('.calendar-area').on('click', '.selectable', function(){
      that.removeSelected();
      $(this).addClass('cal-selected');
    });
    // Submit the chosen date and lease term on save button click
    $('.calendar-area').on('click', '.calendar-foot button', function(){
      var date = moment($('.cal-selected').attr('data-date'), "YYYY-MM-DD");
      var term = $('.calendar-head select option:selected').text();
      term = term.substring(0, term.indexOf(' '));
      var chosen = matrices.getMatricesByDateTerm(date, Number(term));
      console.log(chosen[0]._id.$oid);
    });
    // Callback to rerender the calendar with the lease term is changed slightly hacky but couldn't find a better method yet
    $('.calendar-head select').change(function(){
      leftNext.trigger('click');
      leftPrev.trigger('click');
      that.handleClick();
      that.handleClick();
    });
    this.cleanUp();
  },
  removeSelected(){
    $('.fc-day, .fc-day-number').removeClass('cal-selected');
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
    this.cleanUpLoop($(".jquery-calendar-left .fc-day, .jquery-calendar-left .fc-day-number"), leftMonth);
    this.cleanUpLoop($(".jquery-calendar-right .fc-day, .jquery-calendar-right .fc-day-number"), rightMonth);
    $('.disabled').removeClass('light-green');
  }
})
