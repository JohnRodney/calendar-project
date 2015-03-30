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
      <div className={this.props.name}>
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
    height: 600,
    header: {
      left: '',
      center: '',
      right: 'today prev, next'
    },
    dayRender(date, cell){
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
