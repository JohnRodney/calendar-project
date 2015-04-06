import React from 'react';
import LeaseCalendar from './calendar/lease-calendar';

export default React.createClass({
  render() {
    return (
      React.createElement("div", {className: "calendar-component"},
        React.createElement("div", {className: "right-content"},
          React.createElement(LeaseCalendar, {name: this.props.name})
        )
      )
    );
  }
});
