import React from 'react';
import CalendarComponent from './calendar-component';
import ToggleCalendar from './toggle/toggle-calendar';
import moment from "moment";
import matrices from './matrices/matrices';

//import $ from 'jquery';
//import calendar from 'fullcalendar';

// to compile for prod, run:
// jspm bundle-sfx --minify lib/main
// this will build a file called build.js, then our index, just change
// the scripts to load jpm_packages/traceour(or6to5)-runtime.js
// and build.js

React.render(<ToggleCalendar />, document.getElementById('toggle-target'));
React.render(<CalendarComponent name="jquery-calendar-left" />, document.getElementById('calendar-left'));
React.render(<CalendarComponent name="jquery-calendar-right" />, document.getElementById('calendar-right'));
