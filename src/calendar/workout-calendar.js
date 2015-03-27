import React from 'react';
import moment from 'moment';
import $ from 'jquery';
import jQueryUI from 'jquery-ui';
import fullCalendar from 'fullcalendar';
import WorkoutScheduler from '../../lib/workout-scheduler';
import Tooltip from '../../lib/tooltip';

export default React.createClass({
  componentDidMount() {
    setupCalendar($('.jquery-calendar'));
  },

  render() {
    return (
      <div className="jquery-calendar">
      </div>
    );
  }
});

function setupCalendar(calendar) {
  calendar.fullCalendar({
    editable: true,
    firstDay: 1,
    droppable: true,
    drop(date) {
      console.log(moment(date).toString());
    },
    header: {
      left: '',
      center: 'title',
      right: 'today prev, next'
    },
    dayRender(date, cell){
      var today = new Date();
      var maxDay = moment().add(90, 'day');
      var P = Math.floor(Math.random()*11+1395);
      $(cell).removeClass('fc-today');
      if(date < moment().add(-1, 'day')){
        $(cell).addClass('disabled');
      }
      else if(date > maxDay){
        $(cell).addClass('disabled');
      }
      else{
        $(cell).append("<div class=\"price-holder\"><p>"+ getPrice(P)+"</p></div>");
      }
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
var OriginalPrice = 1400;
function getPrice(p){
  var val = (p-OriginalPrice)*30;
  if(val > 0){
    val = "+$" + val;
  }
  else if(val !== 0){
    val = "-$" + (val*-1);
  }
  return val;
}
