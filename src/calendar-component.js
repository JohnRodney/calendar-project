import React from 'react';
import data from './workouts';
import WorkoutList from './activities/workout-list';
import WorkoutCalendar from './calendar/workout-calendar';
import Tooltip from './tooltip/tooltip';

export default React.createClass({
  render() {
    return (
      <div className="calendar-component">
        <div className="right-content">
          <WorkoutCalendar data={data} name={this.props.name} />
        </div>
        <div className="hidden-Components">
          <Tooltip />
        </div>
      </div>
    );
  }
})
