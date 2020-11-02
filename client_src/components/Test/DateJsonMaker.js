import React, { Component } from 'react';

import Calendar from 'react-calendar';

import classes from './DateJsonMaker.module.css';

class DateJsonMaker extends Component {
  state = {
    date: new Date()
  }

  onViewAvailCalendarChange = date => {
    const newViewDate = new Date(date.getTime());
    this.setState({ date: newViewDate });
  };

  onViewAvailTimeChange = timeMinutes => {
    const newViewDate = new Date(this.state.date.getTime());
    newViewDate.setHours(timeMinutes / 60);
    newViewDate.setMinutes(timeMinutes % 60);

    this.setState({ date: newViewDate });
  };


  render() {
    return (
      <div>
        <h1>JSON Date Maker1</h1>
        <div className={classes.ViewAvailCalendar}>
          <Calendar
            onChange={this.onViewAvailCalendarChange}
            value={this.state.date}
          />
        </div>
        <div className={classes.ViewAvailTime}>
          <p>Time: {this.state.date.getHours()}:{this.state.date.getMinutes()}</p>
          <input
            type="range"
            min="0"
            max="1439"
            step="15"
            value={this.state.date.getHours() * 60 + this.state.date.getMinutes()}
            onChange={(evt) => this.onViewAvailTimeChange(evt.target.value)} />
        </div>
        <div>
          {this.state.date.toJSON()}
        </div>
      </div>
    );
  }
}

export default DateJsonMaker;
