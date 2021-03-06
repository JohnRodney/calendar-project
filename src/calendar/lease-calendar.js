import React from 'react';
import moment from 'moment';
import $ from 'jquery';
import jQueryUI from 'jquery-ui';
import fullCalendar from 'fullcalendar';
import WorkoutScheduler from '../../lib/workout-scheduler';
import Tooltip from '../../lib/tooltip';
import dayhelper from '../format/day-render-helper';

export default React.createClass({
  componentDidMount() {
    setupCalendar($('.' + this.props.name));
  },

  render() {
    return (
      React.createElement('div', {className: this.props.name})
    );
  }
});

var loadFlag = false;
function setupCalendar(calendar) {
  calendar.fullCalendar({
    editable: true,
    firstDay: 0,
    droppable: true,
    header: {
      left: '',
      center: '',
      right: 'today prev, next'
    },
    eventAfterAllRender(){
      getTargetByDiv(this.el.parent().parent()).html('<p>' + this.title + '</p>');
      var that = this;
      $(window).resize(function(){
        calendar.fullCalendar('option', 'contentHeight', that.el.width()+that.el.width()*.1);
        if(that.el.attr('class').indexOf('right') === -1){
          $('#cal-left-holder, #cal-right-holder').css('height', that.el.width()+that.el.width()*0.1+50+'px');
        }
      });
    },
    dayRender(date, cell){
      this.month = date.month();
      dayhelper.renderDay(date, cell);
    },
    eventReceive(event) {
      new WorkoutScheduler(calendar, event).scheduleActivities();
    },
    eventMouseover(event, jsEvent, view) {
      new Tooltip(jsEvent, event).show();
    },
    eventMouseout(event, jsEvent, view) {
      new Tooltip(jsEvent).hide();
    }
  });
}

function getTargetByDiv(selector){
  if(selector.attr('class').indexOf('right') !== -1){
    return $('#cal-right-head')
  }
  return $('#cal-left-head');
}

function getMonthName(num){
  switch(num){
    case 0: return "January";
    case 1: return "February";
    case 2: return "March";
    case 3: return "April";
    case 4: return "May";
    case 5: return "June";
    case 6: return "July";
    case 7: return "August";
    case 8: return "September";
    case 9: return "October";
    case 10: return "November";
    case 11: return "December";
  }
}
