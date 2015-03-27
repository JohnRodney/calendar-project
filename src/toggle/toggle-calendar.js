import React from 'react';
import $ from 'jquery';
import moment from 'moment';
export default React.createClass({
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
    this.registerEvents();
  },
  registerEvents(){
    var rightNext = $('.jquery-calendar-right .fc-next-button');
    var rightPrev = $('.jquery-calendar-right .fc-prev-button');
    var leftNext = $('.jquery-calendar-left .fc-next-button');
    var leftPrev = $('.jquery-calendar-left .fc-prev-button');
    var that = this;
    $('#cal-go-left').click(function(){
      rightPrev.trigger('click');
      leftPrev.trigger('click');
      that.cleanUp();
    })
    $('#cal-go-right').click(function(){
      leftNext.trigger('click');
      rightNext.trigger('click');
      that.cleanUp();
    })
    $('.calendar-area').on('click', '.selectable', function(){
      that.removeSelected();
      $(this).addClass('cal-selected');
    })
    $('.calendar-area').on('click', '.calendar-foot button', function(){
      console.log(moment($('.cal-selected').attr('data-date'), "YYYY-MM-DD"), $('.calendar-head select option:selected').text());
    })
    this.cleanUp();
  },
  removeSelected(){
    $('.fc-day').removeClass('cal-selected');
  },
  cleanUp(){
    var leftMonth = $('.jquery-calendar-left').fullCalendar('getDate');
    var rightMonth = $('.jquery-calendar-right').fullCalendar('getDate');
    $(".jquery-calendar-left .fc-day, .jquery-calendar-left .fc-day-number").each(function(){
      var month = moment($(this).attr('data-date'), "YYYY-MM-DD");
      if(month.month() !== leftMonth.month()){
        $(this).html("");
        $(this).addClass('disabled');
      }
      else if($(this).attr('class').indexOf('disabled') === -1){
        $(this).addClass('selectable');
      }
    });
    $(".jquery-calendar-right .fc-day").each(function(){
      var month = moment($(this).attr('data-date'), "YYYY-MM-DD");
      if(month.month() !== rightMonth.month()){
        $(this).html("");
        $(this).addClass('disabled');
      }
      else if($(this).attr('class').indexOf('disabled') === -1){
        $(this).addClass('selectable');
      }
    });
    $('.disabled').removeClass('light-green');
  }
})
