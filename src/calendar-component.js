import React from 'react';
import LeaseCalendar from './calendar/lease-calendar';

export default React.createClass({
  render() {
    return (
      <div className="calendar-component">
        <div className="right-content">
          <LeaseCalendar name={this.props.name} />
        </div>
      </div>
    );
  }
})
