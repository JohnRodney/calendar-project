import moment from 'moment';
import toggle from '../toggle/toggle-calendar';
import $ from 'jquery';
/* ------------------------------ todos ---------------------------
 * Add a query to database to get an array of matrices
 * remove the randomly generated matrices from the constructor
 * test extensively after plugged into the API
 * Possibly try to optimize the getMatricesByDateTerm
 * --------------------------------------------------------------*/

class matriceManager{
  constructor(){
    this.activeLease = 1;
  }
  // store the cheapest value by the selected term.
  getCheapest(term){
    var cheapest = 900000;
    for(var x = 0; x < this.matrices.length; x++){
      if(this.matrices[x].leaseTerm === term){
        cheapest = Math.min(cheapest, this.matrices[x].finalRent);
      }
    }
    return cheapest;
  }
  // get Matrices by index
  getMatricesByIndex(index){
    return [this.byLease[this.activeLease-1][index]];
  }
  // return a matrice by the date and term passed
  /*getMatricesByDateTerm(date, term){
    return this.byLease[term-1].filter(function(mat){
      return (moment(mat.moveInDate.$date).dayOfYear() === date.dayOfYear() &&
              moment(mat.moveInDate.$date).year() === date.year());
    });
  }*/

  renderCheapest(){
    var base = $('.base-rent-holder');
    if(base.length > 0){
      base.html("$" + this.cheapest);
      return true;
    }
    return false;
  }
  // Get matrices from the server and populate an array of all matrices.
  getMatricesFromServer(unitNumber){

  }
  // break the overall query into a smaller array of just the passed lease term
  filterByLease(term){
    var that = this;
    return this.matrices.filter(function(mat, i, matrices){
      var moveIn = moment(mat.moveInDate, "YYYY-MM-DD").utcOffset(-5)

      if(that.cheapest > mat.finalRent){
        that.cheapest = mat.finalRent;
        that.activeLease = mat.leaseTerm;
      }
      that.cheapest = Math.min(that.cheapest, mat.finalRent);
      if(moveIn.dayOfYear() <= that.earliestMoveIn.dayOfYear() &&
         moveIn.year() <= that.earliestMoveIn.year()){
        that.earliestMoveIn = moveIn;
      }
      if(moveIn.dayOfYear() >= that.lastMoveIn.dayOfYear() &&
         moveIn.year() >= that.lastMoveIn.year()){
        that.lastMoveIn = moveIn;
      }

      return (term === mat.leaseTerm);
    });
  }
  // break the overall array into 15 lease arrays
  breakUpArray(){
    this.earliestMoveIn = moment().add('200', 'days');
    this.lastMoveIn = moment();
    this.cheapest = 90000;
    this.byLease = [];
    this.availableLeases = [];
    for(var x = 0; x < 15; x++){
      this.byLease[x] = this.filterByLease(x+1);
      if(this.byLease[x].length === 0){
        this.availableLeases[x] = false;
      }
      else{
        this.availableLeases[x] = true;
        this.activeLease = x+1;
      }
      this.byLease[x] = this.lookForGaps(this.byLease[x]);
    }
    this.setActiveLease(this.activeLease);
    this.renderInfo();
    return true;
  }
  getRestrictedArray(startDate, endDate){
    // empty array to save entries to
    var returnArray = [];
    // set the compare date to the start date as string to avoid object reference issues
    var currentDate = startDate.format("YYYY-MM-DD");
    // turn the string into a moment
    currentDate = moment(currentDate, "YYYY-MM-DD");
    // add two days so that the loop starts on the first restricted date
    currentDate.add(2, 'days');
    // index to track position in the array
    var index = 0;
    // run until the end date has been reached
    while(currentDate.dayOfYear() !== endDate.dayOfYear()){
      // create an object to insert
      var obj = {}
      // set the date of the object by string to avoid reference issues
      obj.moveInDate = currentDate.format("YYYY-MM-DD");
      // turn it into a moment
      obj.moveInDate = moment(obj.moveInDate, "YYYY-MM-DD");
      // set restricted to true
      obj.restricted = true;
      // save the object into the array
      returnArray[index] = obj;
      // add to index
      index++;
      // add to curendDate
      currentDate.add(2, 'days');
    }
    return returnArray;
  }
  sortByDate(arr){
    arr.sort(function (a, b) {
      if (a.moveInDate.dayOfYear() > b.moveInDate.dayOfYear() && a.moveInDate.year() >= b.moveInDate.year()) {
        return 1;
      }
      if (a.moveInDate.dayOfYear() < b.moveInDate.dayOfYear() && a.moveInDate.year() <= b.moveInDate.year()) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
    return arr;
  }
  lookForGaps(arr){
    // the array to return
    var tempArr = [];
    // loop through the entire array looking for gaps
    var that = this;
    arr.forEach(function(node, i, array){
      // set the restricted value of node to false
      node.restricted = false;
      // turn move in to a mement
      node.moveInDate = moment(node.moveInDate, "YYYY-MM-DD");
      // add the node to the array
      tempArr.push(node);
      // if i is zero then this needs to be the last available lease
      if(i === 0 && node.moveInDate.dayOfYear() !== that.lastMoveIn.dayOfYear()){
        var startDate = node.moveInDate,
            endDate = that.lastMoveIn.format("YYYY-MM-DD");
        endDate = moment(endDate, "YYYY-MM-DD").add(2, 'days');
        tempArr = tempArr.concat(that.getRestrictedArray(startDate, endDate));
      }
      else if(i === array.length-1 && node.moveInDate.dayOfYear() !== that.earliestMoveIn.dayOfYear()){
        var startDate = that.earliestMoveIn.format("YYYY-MM-DD"),
            endDate = node.moveInDate;
        startDate = moment(startDate, "YYYY-MM-DD").add(-2, 'days');
        tempArr = tempArr.concat(that.getRestrictedArray(startDate, endDate));
      }
      // only look at the next array if this isn't the last spot in the array
      if(i < array.length-1){
      // look at the next node and see if they have a date gap of more than 2 days
        if(Math.abs(node.moveInDate.dayOfYear() - moment(array[i+1].moveInDate,"YYYY-MM-DD").dayOfYear()) > 2){
          // set the startDate to the next node and endDate to current node
          var startDate = moment(array[i+1].moveInDate, "YYYY-MM-DD"),
              endDate = node.moveInDate;
          // merge the result of the function into the temporary array
          tempArr = tempArr.concat(that.getRestrictedArray(startDate, endDate));
        }
      }
    });
    // return the new array
    console.log(tempArr);
    return this.sortByDate(tempArr);
  }

  fillSelectBox(){
    var html = '';
    for(var x = 0; x < 15; x++){
      if(this.availableLeases[x]){
        if(this.activeLease === (x+1)){
          html += "<option selected=\"selected\">" + (x+1);
        }
        else{
          html += "<option>" + (x+1);
        }
        if(x === 0){
          html += " month</option>"
        }
        else{
          html += " months</option>"
        }
      }
    }
    $('.cal-select-holder select').html(html);
  }
  renderInfo(){
    this.fillSelectBox();
    this.renderCheapest();
  }
  // calculate the index in the array by the date passed
  getIndexByDate(date){
    var log = false;
    if(date.dayOfYear() === 247){
      log = true;
    }

    var checkDate = date;
    for(var x = 0; x < this.byLease[this.activeLease-1].length; x++){
      var prev = -1, next = -1;
      var current = this.byLease[this.activeLease-1][x].moveInDate;
      if(x > 0){
        prev = this.byLease[this.activeLease-1][x-1].moveInDate;
      }
      if(x < this.byLease[this.activeLease-1].length-1){
        next = this.byLease[this.activeLease-1][x+1].moveInDate;
      }
      if(checkDate.dayOfYear() === current.dayOfYear() && checkDate.year() === current.year()){
        if(log){
           console.log(this.byLease[this.activeLease-1][x]);
        }
        return x;
      }
      else if(prev !== -1){
        if(checkDate.dayOfYear() >= prev.dayOfYear() && checkDate.year() >= prev.year() &&
           checkDate.dayOfYear() <= current.dayOfYear() && checkDate.year() <= current.year()){
          if(log){
             console.log('prev');
          }
          return x-1;
        }
      }
      else if(next !== -1){
        if(checkDate.dayOfYear() > current.dayOfYear() && checkDate.year() >= current.year() &&
           checkDate.dayOfYear() < next.dayOfYear() && checkDate.year() <= next.year()){
          return x;
        }
      }
    }
    return this.byLease[this.activeLease-1].length-1;
  }
  // calculates the first day that is available for the lease term.
  getFirstMoveInDate(){
    return this.byLease[this.activeLease-1][0].moveInDate;
  }
  // the activelease to change cheapest value
  setActiveLease(num){
    this.activeLease = num;
    this.cheapest = this.getCheapest(num);
    this.renderCheapest();
    this.moveInDate = moment(this.getFirstMoveInDate(), "YYYY-MM-DD");
  }
  // redirect to the correct drupal node based on the chosen matrice
  getRedirect(id){
    $.post('http://camden-node-2.herokuapp.com/v1/rent-matrix', {id: id}, function(data){
      window.location.replace(data.url);
    });0
  }
  // loads the matrices from the test server
  testLoader(self, callback, nid){
    var that = self || this;
    $.get("http://camden-node-2.herokuapp.com/v1/" + nid + "/rent-matrix", function(data){
      that.matrices = data;
      var index = 0;
      for(var x = 0; x < 10; x++){
        console.log(that.matrices.splice(index, 1))
        index += 29;
      }
      that.breakUpArray();
      callback();
    });
  }
}
window.testFunction = function(s, e){
   console.log(new matriceManager().getRestrictedArray(s, e));
}
export default new matriceManager();
