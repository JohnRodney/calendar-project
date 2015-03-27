import React from 'react';
import $ from 'jquery';
export default React.createClass({
  render(){
    return (
      <button onClick={this.handleClick}>Toggle Calendar</button>
    );
  },
  handleClick(){
    var target = $('.right-content');
    if(target.css('display') === "none"){
      target.show();
      $('.fc-today-button').trigger('click');
      addSelect();
    }
    else{
      target.hide();
    }
  }
})
function addSelect(){
  $('.fc-center').html('<select><option>1</option><option>2</option><option>3</option>');
}
